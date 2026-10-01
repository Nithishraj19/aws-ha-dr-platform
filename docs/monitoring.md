# Monitoring and alerting reference

CloudWatch is the primary AWS monitoring reference in this design. Choose alarm thresholds from a workload baseline and test alert routing; the Terraform values are examples, not tuned production thresholds.

| Signal | Source / metric | Why it matters | Response example |
|---|---|---|---|
| Request volume | ALB `RequestCount` | Demand and sudden traffic changes | Compare with expected baseline and scaling behavior. |
| HTTP errors | ALB `HTTPCode_ELB_5XX_Count`, `HTTPCode_Target_5XX_Count` | Listener/routing and application failures | Separate load balancer errors from target errors; inspect target logs. |
| Latency | ALB `TargetResponseTime` | User experience and saturation | Check application, DB, dependency, and capacity signals. |
| Unhealthy targets | ALB `UnHealthyHostCount` plus target health | Lost serving capacity | Check `/health`, app logs, security groups, and ASG lifecycle. |
| EC2 CPU | EC2 `CPUUtilization`; ASG desired/in-service/healthy capacity | Capacity pressure or stalled replacement | Check ASG activity and add/adjust capacity after investigation. |
| RDS CPU/connections/storage | RDS `CPUUtilization`, `DatabaseConnections`, `FreeStorageSpace` | DB saturation, pool issues, storage exhaustion | Review queries/pools and storage thresholds; do not rely on CPU alone. |
| RDS availability | RDS events and instance status | Maintenance, reboot, or failover awareness | Confirm endpoint reconnection and application health. |
| Application health | ALB target health and application logs/metrics | Functional service state | Alert on sustained failed checks and correlate with deploys. |
| Backups | AWS Backup job status/events and RDS backup status | Detect missed recovery points | Investigate failed/late jobs; verify retention and restore access. |

CloudWatch does not infer business correctness from a green infrastructure metric. Add synthetic checks for important user journeys, log retention, alarm destinations, and an on-call/runbook process in a real implementation. Backup and restore validation is described in [backup-recovery.md](backup-recovery.md).
