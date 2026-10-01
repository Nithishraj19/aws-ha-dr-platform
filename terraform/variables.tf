variable "aws_region" {
  description = "Example primary AWS Region."
  type        = string
  default     = "ap-south-1"
}
variable "instance_type" {
  description = "Select after workload and cost review."
  type        = string
  default     = "t3.micro"
}
variable "db_instance_class" {
  description = "RDS class; billable if this reference is applied."
  type        = string
  default     = "db.t4g.micro"
}
variable "create_dns_record" {
  description = "Create an alias in an existing Route 53 public hosted zone."
  type        = bool
  default     = false
}
variable "route53_zone_id" {
  description = "Existing hosted zone ID, required only when create_dns_record is true."
  type        = string
  default     = ""
}
variable "app_fqdn" {
  description = "Application DNS name inside the existing hosted zone."
  type        = string
  default     = "ha-dr.example.com"
}
