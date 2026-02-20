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

## 8. Delete Node Group

```bash
eksctl delete nodegroup \
  --region=<REGION> \
  --cluster=<CLUSTER_NAME> \
  --name=<NODEGROUP_NAME>
```

## 9. Delete EKS Cluster

```bash
eksctl delete cluster <CLUSTER_NAME> --region=<REGION>
```

## 10. Other resources to delete (manual)

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

| Placeholder                | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `<CLUSTER_NAME>`           | EKS cluster name (e.g. jobberapp)                    |
| `<REGION>`                 | AWS region (e.g. eu-north-1)                         |
| `<NODEGROUP_NAME>`         | Node group name (e.g. jobber-nodes)                  |
| `<PRIVATE_SUBNET_1>`       | VPC private subnet ID                                |
| `<PRIVATE_SUBNET_2>`       | VPC private subnet ID                                |
| `<YOUR_EC2_KEY_PAIR_NAME>` | EC2 key pair name for SSH access (must exist in AWS) |
| `<NAMESPACE>`              | Kubernetes namespace (e.g. production)               |
| `<POD_NAME>`               | Kubernetes pod name                                  |
| `<DEPLOYMENT_NAME>`        | Kubernetes deployment name                           |
| `<DESIRED_COUNT>`          | Desired number of nodes/replicas                     |
| `<MIN_COUNT>`              | Minimum number of nodes                              |
| `<MAX_COUNT>`              | Maximum number of nodes                              |
