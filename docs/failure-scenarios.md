# Failure scenarios and responses

The paths below describe expected architecture behavior, not observed production events. AWS parts are design expectations only; no AWS failure simulation has been run for this project.

| Scenario | Detection / response / traffic | Recovery and data | RTO/RPO note |
|---|---|---|---|
| EC2 instance failure | ALB target health fails; traffic goes to healthy registered targets. ASG replaces unhealthy capacity. | Inspect instance/system and application logs; confirm replacement reaches healthy state. App state should be externalized. | Replacement and warm-up are not immediate; application data should not live only on the instance. |
| ALB target failure | Target health check `/health` fails; ALB stops routing to that target. | Repair or replace target, then verify it becomes healthy. | Served by remaining targets if there is enough capacity. |
| Application failure | Health endpoint, target health, error/latency metrics and logs detect failure. | Roll back or repair release, validate endpoint and user journey. | A shallow health check can miss a dependency/business failure; add suitable checks. |
| Availability Zone failure | ALB and ASG use both AZs; failed AZ targets stop serving, ASG maintains capacity in surviving AZ subject to capacity/quota. | Confirm healthy AZ capacity, scale if necessary, inspect ASG activity and RDS status. | Multi-AZ improves availability but does not guarantee zero interruption or enough remaining capacity. |
| RDS primary failure | RDS events/status and application connection errors indicate failover; managed RDS Multi-AZ promotes standby. | App reconnects through the same DB endpoint; verify transactions and DB status after failover. | Existing connections can break. Multi-AZ failover is not protection from bad writes/corruption. |
| Accidental deletion / corruption | Application audit/logs, integrity checks, or user reports; stop destructive writes if safe. | Restore RDS to a new instance from snapshot/PITR, validate data, then controlled cutover. | RPO depends on selected recovery point and retention; restore duration affects RTO. |
| Regional failure | Primary service/health signals and AWS service status; regional DR is a separate plan. | Restore/copy data and artifacts, provision recovery environment, validate, then use configured DNS failover. | No secondary Region is deployed here. TTL and recursive resolver caches delay DNS adoption. |

## Local simulations

The local container can demonstrate process-health detection, but it cannot emulate AWS AZ routing, Auto Scaling, RDS failover, backups, or Route 53. Run `docker compose up --build -d`, verify `/health` and `/version`, then `docker compose stop app` to observe local unavailability; `docker compose start app` restarts it. Use `docker compose logs app` to inspect logs. Do not describe this as an AWS failover test.
