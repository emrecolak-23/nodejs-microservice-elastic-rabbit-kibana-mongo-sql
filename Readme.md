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

## 5. Delete EKS Cluster

```bash
eksctl delete cluster <CLUSTER_NAME> --region=<REGION>
```

## 6. Other resources to delete (manual)

- NAT Gateway
- Elastic IP
- RDS MySQL instance
- RDS PostgreSQL instance

---

### Placeholders

| Placeholder                | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `<CLUSTER_NAME>`           | EKS cluster name (e.g. jobberapp)                    |
| `<REGION>`                 | AWS region (e.g. eu-north-1)                         |
| `<NODEGROUP_NAME>`         | Node group name (e.g. jobber-nodes)                  |
| `<PRIVATE_SUBNET_1>`       | VPC private subnet ID                                |
| `<PRIVATE_SUBNET_2>`       | VPC private subnet ID                                |
| `<YOUR_EC2_KEY_PAIR_NAME>` | EC2 key pair name for SSH access (must exist in AWS) |
