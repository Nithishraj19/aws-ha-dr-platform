# Interview guide: AWS HA and DR

Describe this accurately as a **hands-on portfolio project and reference design**. Terraform and local demo were authored for practice; no AWS resources or production failovers were run. The values for RTO/RPO are examples, not measured outcomes.

## Design decisions

**Why Multi-AZ?** It places serving compute and managed database failover capacity across AZ failure domains within one Region. It reduces some interruption risks but does not protect against regional loss, corruption, application defects, or insufficient surviving capacity.

**Why an Application Load Balancer?** It provides an HTTP-aware entry point, target health checks, and distributes requests to healthy targets. It also keeps clients from addressing individual EC2 instances.

**Why Auto Scaling?** It replaces unhealthy instances and adjusts serving capacity based on policy. Minimum/desired capacity across multiple AZs should be planned so surviving zones can carry expected load.

**Why Route 53?** It manages DNS names and supports routing policies, aliases to AWS resources, and health evaluation. Route 53 decisions happen through DNS answers; they do not instantly change every client's active connection.

**What does a Route 53 health check do?** A health check probes an endpoint periodically, or an alias can evaluate the AWS target's health. It is not a synchronous check per DNS query. For an ALB alias, Evaluate Target Health can use the ALB target health and avoid a redundant health check against the same alias.

**Does DNS failover happen instantly?** No. Health detection takes time and recursive resolvers/clients may cache old answers up to TTL or their own caching behavior. Plan TTL, health-check interval/failure threshold, client reconnects, and a healthy secondary endpoint.

**Why private subnets?** App hosts and databases should not accept direct internet traffic. Security groups admit only the required tier-to-tier paths; private instances use controlled egress such as per-AZ NAT or VPC endpoints where needed.

**How do Security Groups help?** They are stateful instance/resource firewalls. This design allows internet-to-ALB HTTP demo traffic, ALB-to-app on 8080, and app-to-PostgreSQL on 5432. A deployed system should use HTTPS and narrowly reviewed outbound rules.

**What is least privilege IAM here?** EC2 assumes an instance role for management/logging instead of long-lived access keys. Backup assumes a service role. Any secret-read permission should be scoped to the exact required secret and action.

**How is encryption handled?** TLS should protect user and service traffic; RDS and S3 use encryption at rest with KMS in the reference. Key policy, rotation, access logs, and recovery access also need review.

## Data, recovery, and operations

**What does RDS Multi-AZ provide?** A managed standby in another AZ and automatic DB instance failover with a stable database endpoint. The standby is for availability, not read scaling. Applications must reconnect after failover.

**RDS Multi-AZ vs Read Replica?** Multi-AZ primarily provides synchronous standby failover for availability (implementation varies by deployment type); a read replica is primarily for read scaling and can be promoted, with different replication lag and recovery properties. One does not replace the other.

**Backup vs DR?** A backup is a recovery point. Restore creates and validates a usable resource from it. DR is the coordinated ability to recover an application and its data after a major outage, including dependencies, access, traffic, people, and runbooks.

**RTO vs RPO?** RTO is the targeted duration to restore service; RPO is the targeted amount of data loss measured in time. Objectives must be validated in timed exercises.

**How do automated backups/PITR help?** They provide restore points inside retention to recover from deletion or corruption. Restore generally produces a new DB instance; validate it before cutover.

**Why AWS Backup as well as RDS backups?** AWS Backup centralizes policy, vaults, lifecycle, job visibility, and supported copies. RDS native backups provide RDS-managed automated backup/PITR behavior. Avoid overlapping plans without understanding their retention and recovery semantics.

**Why S3?** It stores artifacts and selected recovery files durably with versioning/encryption. It is not a replacement for transaction-consistent database backups.

**How would you test backups?** Restore a recovery point to an isolated DB, validate schema/data/application behavior, measure time and data point, then document cleanup. A successful backup job alone is insufficient.

## Failures and DR choices

**What happens when EC2 fails?** ALB stops sending new requests to the unhealthy target and ASG replaces capacity, assuming a health-check failure is detected and the AZ has room.

**What happens when an AZ fails?** ALB uses healthy targets in another enabled AZ; ASG can replace capacity there subject to quotas/capacity. RDS Multi-AZ can fail over if the primary is impacted. App reconnection and remaining capacity still matter.

**What happens when RDS primary fails?** RDS promotes the standby and moves the DB endpoint. Clients with existing sessions reconnect; validate app behavior and RDS events.

**What if data is deleted or corrupted?** Stop or isolate the source of damage where possible, restore to a separate database at a chosen time, validate business data, then execute controlled connection cutover. Multi-AZ replicates writes and does not undo them.

**What is Pilot Light?** Keep core data and minimal foundational services ready in another Region, then provision most compute on demand. Lower idle cost can mean longer RTO and more operational steps.

**What is Warm Standby?** Maintain a reduced-capacity but functioning secondary environment, then scale it up and shift traffic. It can shorten recovery time but incurs more ongoing cost.

**What is Backup and Restore?** Recreate infrastructure and restore data after a disaster. It is often lower cost at rest but usually has longer recovery time and depends on tested automation and available quotas.

**What is Multi-Region active/active?** Serve from multiple Regions and manage cross-Region data consistency, routing, and conflict behavior. It can improve regional availability but adds significant cost and complexity.

**How would you design DR for a critical application?** Start with business RTO/RPO and failure scope. Choose a strategy, data replication/backup policy, identity/network dependencies, tested infrastructure automation, DNS/traffic control, and runbooks. Exercise restore/failover regularly and update targets from measured evidence.

## Cost trade-offs

**Why not always choose Multi-Region?** It adds duplicated capacity, data movement, operational complexity, and consistency decisions. Match it to business objectives and budget.

**How does Multi-AZ affect cost?** It uses additional standby/serving/network capacity. The cost may be justified by reduced outage exposure for workloads with stricter availability goals.

**How do NAT, ALB, Backup, and CloudWatch affect cost?** NAT charges for gateway time and data; ALB for provisioned time and processed traffic; backups for retained recovery data/copies; CloudWatch for metrics, logs, retention, alarms, and queries. Review actual current pricing before deployment.
