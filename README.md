# AWS High Availability & Disaster Recovery Platform

> **HANDS-ON PORTFOLIO PROJECT** — architecture and Terraform are learning/reference materials. **AWS infrastructure is not deployed by default; Terraform is provided as a reference/learning implementation.** This repository does not claim production AWS experience, real failovers, measured RTO/RPO, or cost savings.

This project explores how a multi-AZ application can continue through selected instance/AZ failures, and how a separate recovery plan addresses larger regional failures, data corruption, or accidental deletion. A small Node.js service runs locally in Docker so the health/version contract can be exercised without AWS credentials.

## Architecture

![AWS HA and DR architecture](architecture/architecture.png)

The primary design is a **single-Region Multi-AZ HA reference**: Route 53 provides the application name, an internet-facing ALB spans public subnets, and forwards to EC2 instances managed by an Auto Scaling group in private application subnets across two AZs. A private PostgreSQL RDS Multi-AZ instance has a primary and managed standby in separate private DB subnets. The standby supports failover; it is not a read replica. S3 stores artifacts/recovery material, AWS Backup manages scheduled recovery points, and CloudWatch provides infrastructure signals.

The dashed **DR REGION — REFERENCE ONLY** path is a strategy discussion. The repository does not provision a second Region. DNS health evaluation and failover depend on healthy records/targets; DNS caches and TTL mean failover is not instantaneous. See [architecture notes](architecture/architecture.md) and [RTO/RPO examples](docs/rto-rpo.md).

## Why these services

- **Route 53:** application DNS, alias to the ALB, and a foundation for documented failover routing.
- **ALB:** HTTP-aware routing to healthy app targets across AZs.
- **EC2 Auto Scaling:** replaces unhealthy instances and maintains planned capacity across AZs.
- **RDS Multi-AZ:** managed primary/standby failover for DB instance/AZ issues.
- **S3:** encrypted/versioned artifact and recovery-file storage; **not a database backup replacement**.
- **AWS Backup and RDS backups:** scheduled recovery points, retention, and restore workflows.
- **CloudWatch:** ALB, EC2/ASG, RDS, application, and backup signals.
- **IAM and Security Groups:** instance/service roles and restricted tier-to-tier network paths.

## HA and DR are different

**High availability** reduces interruption when an instance or Availability Zone fails by distributing traffic and capacity across AZs and using managed database failover. **Disaster recovery** restores service after larger failures such as a Region outage, data corruption, or accidental deletion. Multi-AZ alone is not regional disaster recovery and does not undo bad data writes.

Four strategies are compared in the interview guide: Backup and Restore, Pilot Light, Warm Standby, and Multi-Region. Only Multi-AZ high availability is the primary architecture in this project; the regional DR alternatives are reference-only.

## Security design

Route 53 and the ALB are the internet-facing entry points. App EC2 and RDS reside in private subnets. The RDS instance has `publicly_accessible = false`; its security group accepts PostgreSQL only from the application security group. The reference uses an EC2 IAM role rather than embedded access keys, IMDSv2, encrypted RDS/S3 storage, and a Secrets Manager-managed RDS master password. For a real deployment, add ACM HTTPS, review every egress path, secret access, key policy, audit settings, patching, and data-classification requirements. No secrets belong in Git or `terraform.tfvars`.

## Failure handling

| Failure | Expected design response |
|---|---|
| EC2 / ALB target | Target health removes the unhealthy host from new traffic; Auto Scaling replaces capacity. |
| Application | Health, errors, latency, and logs indicate the fault; repair or roll back and revalidate. |
| Availability Zone | ALB routes to healthy targets in the other AZ; Auto Scaling maintains capacity subject to quotas and available capacity. |
| RDS primary | RDS promotes standby; clients reconnect through the same endpoint after failover. |
| Deletion / corruption | Restore an RDS recovery point to a separate DB, validate, and cut over deliberately. |
| Regional failure | Follow a separate DR runbook, restore data/capacity, validate, then change DNS; this project does not deploy that Region. |

Details, detection, data notes, recovery actions, and local limits are in [failure scenarios](docs/failure-scenarios.md).

## RTO and RPO

The project includes **example architecture targets — not measured production values**. RTO is the recovery-time objective; RPO is the recovery-point objective. Example targets must be validated with timed failure and restore exercises before being treated as operational objectives. See [docs/rto-rpo.md](docs/rto-rpo.md).

## Backup and recovery

RDS automated backups support point-in-time recovery within retention; snapshots provide explicit recovery points; AWS Backup centralizes plan/vault/retention; S3 stores artifacts. A restored database should be created separately, validated for correctness and application access, and only then considered for cutover.

> A backup strategy is incomplete until recovery is tested.

See the [restore validation procedure](docs/backup-recovery.md).

## Monitoring

CloudWatch is the primary AWS monitoring reference. The monitoring guide covers ALB request volume/errors/latency/unhealthy targets, EC2 CPU and ASG capacity, RDS CPU/connections/storage/events, application health, and backup job status. Terraform includes example alarms for unhealthy targets and database/compute signals; tune thresholds and alert destinations for an actual workload. Read [docs/monitoring.md](docs/monitoring.md).

## Cost and reliability

Higher availability generally requires additional infrastructure and operational work. Multi-AZ compute/database, ALB, NAT for private egress, backup retention/copies, KMS, and CloudWatch can incur charges. Multi-Region adds duplicated capacity, replication/transfer, and testing complexity. No cost numbers are invented here. Choose based on business criticality, recovery objectives, availability needs, workload, and budget. Detailed trade-offs: [docs/cost-considerations.md](docs/cost-considerations.md). Project 9 will cover detailed AWS cost optimization.

## Repository layout

```text
application/       Node.js /health and /version demo, tests, Dockerfile
architecture/      architecture.png and explanation
terraform/         AWS reference configuration; never applied for this project
docs/              failure, backup, monitoring, RTO/RPO, cost and interview guides
docker-compose.yml local demo launcher
```

## Run the local demo

Requirements: Docker with Compose. No AWS account is needed.

```sh
docker compose up --build -d
curl -fsS http://localhost:3000/health
curl -fsS http://localhost:3000/version
docker compose logs app
docker compose stop
docker compose start
docker compose down
```

The `/health` response is `{"status":"UP"}`. The `/version` endpoint reports `APP_VERSION` (default `1.0.0`). You can set another version with `APP_VERSION=1.1.0 docker compose up --build -d`.

Run the application test without Docker:

```sh
cd application
npm test
```

## Terraform reference

Terraform is a hands-on configuration exercise, not an instruction to create resources. **Do not run `terraform apply` for this project.** No paid AWS infrastructure has been deployed. See [terraform/README.md](terraform/README.md) for scope, prerequisites, and safe static validation commands. Terraform CLI may be needed for `fmt` and `validate`.

## Validation performed

Project validation is local only: Node unit test, Docker Compose configuration/build (when Docker daemon is available), Terraform formatting/validation when the CLI/provider are available, Markdown link checks, and consistency review. No AWS resources or AWS failure scenarios are provisioned or claimed as tested.

## Interview preparation

See [docs/interview-guide.md](docs/interview-guide.md) for engineering trade-offs and answers covering Multi-AZ, ALB, Auto Scaling, Route 53/DNS, RDS failover, backup/restore, DR strategies, RTO/RPO, security, and cost.

## Disclaimer

This is a **hands-on portfolio project** for architecture and configuration practice. AWS infrastructure is not deployed by default; Terraform is provided as a reference/learning implementation. Do not represent it as a production AWS deployment or claim observed production failover, recovery measurements, or savings.
