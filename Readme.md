# Jobber App - AWS EKS Setup

## 1. Create EKS Cluster

Creates an empty EKS control plane (no worker nodes). Run this first.

```bash
eksctl create cluster --name=<CLUSTER_NAME> \
  --region=<REGION> \
  --vpc-private-subnets=<PRIVATE_SUBNET_1>,<PRIVATE_SUBNET_2> \
  --without-nodegroup
```

## 2. Add Node Group

Add worker nodes to the cluster. Run after cluster creation.

```bash
eksctl create nodegroup --cluster=<CLUSTER_NAME> \
  --region=<REGION> \
  --name=<NODEGROUP_NAME> \
  --subnet-ids=<PRIVATE_SUBNET_1>,<PRIVATE_SUBNET_2> \
  --node-type=t3.medium \
  --nodes=4 \
  --nodes-min=4 \
  --nodes-max=6 \
  --node-volume-size=20 \
  --ssh-access \
  --ssh-public-key=<YOUR_EC2_KEY_PAIR_NAME> \
  --managed \
  --asg-access \
  --external-dns-access \
  --full-ecr-access \
  --appmesh-access \
  --alb-ingress-access \
  --node-private-networking
```

## 3. Associate IAM OIDC Provider

Enables IRSA (IAM Roles for Service Accounts) so pods can assume IAM roles. Required for AWS load balancer controller, etc.

```bash
eksctl utils associate-iam-oidc-provider \
  --region=<REGION> \
  --cluster=<CLUSTER_NAME> \
  --approve
```

## 4. Update Local kubeconfig

Merges EKS cluster credentials into `~/.kube/config` so you can use `kubectl` locally.

```bash
aws eks update-kubeconfig --name=<CLUSTER_NAME> --region=<REGION>
```

## 5. Scale Node Group

Scale the number of nodes up or down.

```bash
eksctl scale nodegroup \
  --cluster=<CLUSTER_NAME> \
  --region=<REGION> \
  --name=<NODEGROUP_NAME> \
  --nodes=<DESIRED_COUNT> \
  --nodes-min=<MIN_COUNT> \
  --nodes-max=<MAX_COUNT>
```

### Pause cluster (scale to 0)

Stop all nodes to avoid costs when not in use.

```bash
eksctl scale nodegroup \
  --cluster=<CLUSTER_NAME> \
  --region=<REGION> \
  --name=<NODEGROUP_NAME> \
  --nodes=0 \
  --nodes-min=0
```

## 6. Reset NotReady Nodes

If nodes get stuck in NotReady state (e.g. due to memory pressure), delete them and let the ASG recreate them.

```bash
# Delete all NotReady nodes
kubectl get nodes | grep NotReady | awk '{print $1}' | xargs kubectl delete node

# Or delete all nodes at once
kubectl delete node --all
```

ASG will automatically launch new healthy nodes.

## 7. Fix IP Address Assignment (AWS CNI)

If pods fail with `failed to assign an IP address to container`, enable prefix delegation:

```bash
kubectl set env daemonset aws-node \
  -n kube-system \
  ENABLE_PREFIX_DELEGATION=true
```

Then delete stuck pods so they get rescheduled on nodes with updated CNI:

```bash
# Force delete stuck pods
kubectl get pods -n <NAMESPACE> | grep -E "ContainerCreating|Terminating" | awk '{print $1}' | \
  xargs kubectl delete pod -n <NAMESPACE> --force --grace-period=0
```

## 8. Configure Domain with Route 53 & ACM

### 8.1 Create Hosted Zone in Route 53

```
AWS Console → Route 53
→ Hosted Zones → Create Hosted Zone
→ Domain name: yourdomain.com
→ Type: Public hosted zone
→ Create
```

Copy the 4 NS records provided by Route 53 (without trailing dots):

```
ns-xxx.awsdns-xx.com
ns-xxx.awsdns-xx.net
ns-xxx.awsdns-xx.org
ns-xxx.awsdns-xx.co.uk
```

### 8.2 Update Nameservers on Your Domain Registrar (e.g. GoDaddy)

```
GoDaddy → My Products → Domains
→ Click your domain
→ DNS → Nameservers → Change Nameservers
→ Enter my own nameservers
→ Paste the 4 NS records from Route 53 (remove trailing dots)
→ Save
```

> Propagation can take 24-48 hours.

### 8.3 Request SSL Certificate via AWS Certificate Manager (ACM)

```
AWS Console → Certificate Manager
→ Request a certificate
→ Request a public certificate
→ Add domain names:
     yourdomain.com          ← main domain
     *.yourdomain.com        ← wildcard for subdomains
→ Validation method: DNS validation
→ Request
```

### 8.4 Validate Certificate via DNS (CNAME)

After requesting, ACM will show a CNAME record to validate ownership:

```
AWS Console → Certificate Manager → Your certificate
→ Click "Create records in Route 53"
→ AWS will automatically add the CNAME record to your Hosted Zone
```

Wait for the certificate status to change from **Pending validation** to **Issued** (usually 5-30 minutes).

### 8.5 Verify DNS Propagation

```bash
# Check NS records
dig yourdomain.com NS

# Check CNAME validation record
dig _xxxxx.yourdomain.com CNAME
```

---

## 9. AWS Load Balancer Controller - IAM Setup

### 9.1 Download and Create IAM Policy

```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.14.1/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json
```

### 9.2 Create IAM Service Account

```bash
eksctl create iamserviceaccount \
  --cluster=<CLUSTER_NAME> \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::<AWS_ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve
```

### 9.3 Install AWS Load Balancer Controller via Helm

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=<CLUSTER_NAME> \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=<REGION> \
  --set vpcId=<VPC_ID> \
  --set image.repository=<AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/amazon/aws-load-balancer-controller
```

### 9.4 Verify Installation

```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
```

Expected output:

```
NAME                           READY   UP-TO-DATE   AVAILABLE
aws-load-balancer-controller   2/2     2            2
```

---

## 10. External DNS - IAM Setup (Route 53)

External DNS is used to automatically create DNS records in Route 53 for hostnames defined in the Gateway Ingress. First, create an IAM policy in AWS, then attach it to a service account using the policy ARN.

### 10.1 Create IAM Policy (AllowExternalDNSUpdates)

First, create an IAM policy named `AllowExternalDNSUpdates` in AWS. This policy allows External DNS to update DNS records in Route 53 hosted zones.

Create a `policy.json` file:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["route53:ChangeResourceRecordSets", "route53:ListResourceRecordSets", "route53:ListTagsForResources"],
      "Resource": ["arn:aws:route53:::hostedzone/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["route53:ListHostedZones"],
      "Resource": ["*"]
    }
  ]
}
```

Create the policy with AWS CLI:

```bash
aws iam create-policy \
  --policy-name AllowExternalDNSUpdates \
  --policy-document file://policy.json
```

You will see the policy ARN in the output: `arn:aws:iam::<AWS_ACCOUNT_ID>:policy/AllowExternalDNSUpdates`

### 10.2 Create IAM Service Account for External DNS

Create the service account using the ARN of the policy you created:

```bash
eksctl create iamserviceaccount \
  --name gateway-external-dns \
  --namespace production \
  --cluster <CLUSTER_NAME> \
  --attach-policy-arn arn:aws:iam::<AWS_ACCOUNT_ID>:policy/AllowExternalDNSUpdates \
  --approve \
  --override-existing-serviceaccounts
```

### 10.3 Apply External DNS Manifest

After creating the IAM service account, get the role ARN and update the manifest:

```bash
kubectl get sa gateway-external-dns -n production -o yaml
```

Replace `<GATEWAY_EXTERNAL_DNS_IAM_ROLE_ARN>` in `k8s/AWS/jobber-gateway/gateway-external-dns.yaml` with the `eks.amazonaws.com/role-arn` value from the output, then apply:

```bash
kubectl apply -f k8s/AWS/jobber-gateway/gateway-external-dns.yaml
```

To delete the service account:

```bash
eksctl delete iamserviceaccount \
  --cluster <CLUSTER_NAME> \
  --name gateway-external-dns
```

---

## 11. Delete Node Group

```bash
eksctl delete nodegroup \
  --region=<REGION> \
  --cluster=<CLUSTER_NAME> \
  --name=<NODEGROUP_NAME>
```

## 12. Delete EKS Cluster

```bash
eksctl delete cluster <CLUSTER_NAME> --region=<REGION>
```

## 13. Other resources to delete (manual)

- NAT Gateway
- Elastic IP
- RDS MySQL instance
- RDS PostgreSQL instance

---

## Useful kubectl Commands

```bash
# List all nodes with status
kubectl get nodes

# List nodes with extra info (IP, instance type)
kubectl get nodes -o wide

# Watch nodes in real time
kubectl get nodes -w

# List all pods in a namespace
kubectl get pods -n <NAMESPACE>

# Describe a pod (events, errors)
kubectl describe pod <POD_NAME> -n <NAMESPACE>

# View pod logs
kubectl logs <POD_NAME> -n <NAMESPACE>

# Force delete terminating pods
kubectl delete pod <POD_NAME> -n <NAMESPACE> --force --grace-period=0

# Scale a deployment
kubectl scale deployment <DEPLOYMENT_NAME> --replicas=<COUNT> -n <NAMESPACE>
```

---

## Useful eksctl Commands

```bash
# List clusters
eksctl get cluster --region=<REGION>

# List node groups
eksctl get nodegroup --cluster=<CLUSTER_NAME> --region=<REGION>

# Describe stacks (for debugging CloudFormation errors)
eksctl utils describe-stacks --region=<REGION> --cluster=<CLUSTER_NAME>
```

---

## Placeholders

| Placeholder                           | Description                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<CLUSTER_NAME>`                      | EKS cluster name (e.g. jobberapp)                                                                                                                 |
| `<REGION>`                            | AWS region (e.g. eu-north-1)                                                                                                                      |
| `<NODEGROUP_NAME>`                    | Node group name (e.g. jobber-nodes)                                                                                                               |
| `<PRIVATE_SUBNET_1>`                  | VPC private subnet ID                                                                                                                             |
| `<PRIVATE_SUBNET_2>`                  | VPC private subnet ID                                                                                                                             |
| `<YOUR_EC2_KEY_PAIR_NAME>`            | EC2 key pair name for SSH access (must exist in AWS)                                                                                              |
| `<NAMESPACE>`                         | Kubernetes namespace (e.g. production)                                                                                                            |
| `<POD_NAME>`                          | Kubernetes pod name                                                                                                                               |
| `<DEPLOYMENT_NAME>`                   | Kubernetes deployment name                                                                                                                        |
| `<DESIRED_COUNT>`                     | Desired number of nodes/replicas                                                                                                                  |
| `<MIN_COUNT>`                         | Minimum number of nodes                                                                                                                           |
| `<MAX_COUNT>`                         | Maximum number of nodes                                                                                                                           |
| `<AWS_ACCOUNT_ID>`                    | AWS account ID (e.g. 111122223333)                                                                                                                |
| `<GATEWAY_EXTERNAL_DNS_IAM_ROLE_ARN>` | IAM role ARN for gateway-external-dns SA (from `kubectl get sa gateway-external-dns -n production -o yaml` after eksctl create iamserviceaccount) |
| `<VPC_ID>`                            | VPC ID (e.g. vpc-0d9ffd34b915637be)                                                                                                               |
