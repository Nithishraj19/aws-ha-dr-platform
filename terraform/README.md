# Terraform reference

This is an infrastructure learning/reference configuration for the primary Region design. It describes VPC public/app/database subnet tiers in two AZs, an internet-facing ALB, private EC2 Auto Scaling, private encrypted RDS PostgreSQL Multi-AZ, S3 artifact storage, AWS Backup, CloudWatch alarms, IAM roles, and an optional Route 53 alias to an existing zone.

**Do not run `terraform apply` for this portfolio task. No AWS resources have been provisioned.** Applying the configuration can create billable resources, including NAT if added for private egress, ALB, EC2, RDS, backup storage, KMS, and CloudWatch. Review the plan, prices, quotas, security, and cleanup implications in an explicitly authorized sandbox before any future deployment.

The local application is independently tested with Docker and does not need AWS credentials. Terraform uses the normal AWS credential chain; there are no credentials in this repository. The RDS master password is managed by RDS/Secrets Manager rather than supplied as a Terraform variable. Terraform state can contain sensitive metadata and must be secured if this is adapted.

```sh
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
terraform -chdir=terraform fmt -check -recursive
terraform -chdir=terraform init -backend=false
terraform -chdir=terraform validate
```

`create_dns_record` defaults to false and requires an existing public hosted zone if enabled. The Route 53 alias evaluates ALB target health; it is not a deployed multi-Region failover policy. The `DR REGION — REFERENCE ONLY` path remains documentation, not Terraform.
