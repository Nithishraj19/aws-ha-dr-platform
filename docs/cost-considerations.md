# Cost and reliability trade-offs

No cost estimates are included because prices vary by Region, usage, retention, and current AWS pricing. Most Terraform resources in this reference create billable services if applied. **No resources are deployed by default in this portfolio workflow.**

| Choice | Reliability effect | Cost / operational trade-off |
|---|---|---|
| Multi-AZ vs Single-AZ application | Keeps load-balanced capacity across an AZ outage when spare healthy capacity exists. | Duplicated/idle capacity and more network paths; health checks and capacity policies need tuning. |
| Multi-Region vs Single-Region | Can address regional failures if data and traffic failover are ready. | Duplicated infrastructure, data replication/backup transfer, testing, operational complexity, and DNS cache delay. |
| RDS Multi-AZ vs simpler database | Managed standby supports database availability and failover. | Standby and cross-AZ data transfer add cost; a standby is generally not read-scaling capacity. |
| NAT Gateway vs alternatives | Managed outbound path for private instances, deployed per AZ to avoid a single-AZ egress dependency. | Hourly and data processing charges per gateway. Alternatives include VPC endpoints for supported AWS services, prebuilt images, or controlled egress appliances; none is universally cheaper. |
| ALB vs DNS/direct routing | Layer 7 health-aware distribution and TLS termination patterns. | ALB hours and processed traffic; DNS alone cannot replace application-level load balancing. |
| Backup retention | Longer retention and copies improve recovery choices. | Storage and cross-Region copy cost grows with retained data and change rate. Set lifecycle by compliance and recovery needs. |
| CloudWatch | Metrics, logs, dashboards, alarms, and events aid detection. | Ingestion, retention, custom metrics, queries, and alarms can incur cost; filter and retain intentionally. |

Select an architecture based on business criticality, RTO/RPO, availability needs, budget, data behavior, and operational capability. Project 9 is intended to cover detailed AWS cost optimization; this project explains only the reliability trade-offs.
