# RTO and RPO

**RTO (Recovery Time Objective)** is the planning target for how long a service can be unavailable. **RPO (Recovery Point Objective)** is the target for how much recent data the business can tolerate losing. Neither is a promise about measured recovery performance.

> **Example architecture targets — not measured production values.** These are discussion examples for this portfolio design. They have not been validated by a deployed environment or recovery exercise.

| Scenario / approach | Example RTO target | Example RPO target | Mechanism and limitation |
|---|---:|---:|---|
| EC2 or single AZ loss (Multi-AZ HA) | 5–15 minutes | Near-zero application state loss if state is externalized | ALB health checks and ASG replacement/routing preserve service where healthy capacity remains; replacement takes time. |
| RDS Multi-AZ primary failover | 5–15 minutes | Synchronous standby replication design | Managed standby promotion retains the DB endpoint; connections must reconnect and DNS caches expire. Not a backup against logical corruption. |
| Restore from an RDS automated backup/PITR | 1–4 hours | Up to 5 minutes as a planning target | Restore creates a database copy; duration depends on size and restore workload. PITR is bounded by backup retention and latest restorable time. |
| Regional recovery (backup and restore) | 4–24 hours | 1–24 hours | Requires cross-region backup/artifact copies, capacity provisioning, data validation, and DNS change. Not deployed by this project. |

The values above are illustrative planning targets only. Actual objectives depend on database size, change rate, recovery automation, DNS caching, account quotas, application behavior, and a successful timed exercise.

## How the design contributes

- **RDS Multi-AZ** handles a DB instance/AZ outage through managed standby promotion. It supports availability; it does not recover deleted or corrupted records.
- **RDS automated backups and point-in-time recovery** support restoring to an earlier time inside the configured retention window. A restore creates a new DB instance that must be validated and cut over.
- **AWS Backup** provides policy-based scheduling, retention, and recovery-point management. A backup job status is not proof that an application restore works.
- **S3** holds deployment/recovery artifacts and can retain versions. It is not a substitute for RDS-consistent database backups.
- **ALB and Auto Scaling** route away from unhealthy targets and replace compute capacity; replacement and warm-up are not instantaneous.
- **Route 53 failover** can return a secondary endpoint when the primary is unhealthy and a usable secondary is configured. Resolver caches and TTLs mean clients may continue using old answers after a DNS change.

## How to validate targets

Run timed tests in an approved non-production AWS account: record detection, recovery, application reconnection, data point, and user-visible restoration. Repeat across AZ, DB failover, snapshot/PITR restore, and regional recovery; update objectives from measured evidence. This repository has not run those tests.
