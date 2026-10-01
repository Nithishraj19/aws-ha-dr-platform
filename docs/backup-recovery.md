# Backup and recovery

> A backup strategy is incomplete until recovery is tested.

## What protects what

- **RDS automated backups** support point-in-time recovery during the configured retention period. A restore creates a new DB instance; it is not an in-place rewind.
- **RDS snapshots** are manual recovery points that remain until deleted and are useful before planned changes or for explicit retention.
- **AWS Backup** applies a central plan, vault, lifecycle, and job history. A completed backup job still needs a restore exercise.
- **S3** stores application artifacts and selected recovery material with versioning and encryption. It is not a database backup replacement and does not make arbitrary application data consistent.
- **High availability** keeps service operating through some component/AZ failures. **Restore** returns data or a system from a recovery point. **Disaster recovery** coordinates people, data, capacity, network, and traffic for larger failures.

## Recovery-validation procedure (run only in an authorized non-production account)

1. Choose a recovery point and record its timestamp, source DB, retention status, and expected RPO.
2. Restore to a **new isolated DB instance** in private subnets. Never overwrite the source during the exercise.
3. Wait for the restore job and DB status to complete. Record elapsed time as an observation, not a universal guarantee.
4. Restrict access to a test application/host. Validate connectivity, schema, row counts, key business invariants, and a representative read/write workflow.
5. Compare restored data to an independently chosen timestamp or test marker; record observed recovery point and any data gap.
6. If testing a cutover, update a non-production connection target, restart/reconnect clients, and run application health/smoke checks.
7. Record RTO/RPO observations, gaps, owners, and follow-up actions. Confirm alarms and access paths work.
8. Delete the temporary restore only after evidence is retained and the owner approves cleanup.

For regional DR, repeat with a recovery point/artifact copied to the alternate Region, provision the documented network and compute dependencies, validate database and application, then test Route 53 failover and resolver cache behavior. The alternate Region is not deployed by this project.
