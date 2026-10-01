output "alb_dns_name" {
  description = "Primary application ALB DNS name."
  value       = aws_lb.app.dns_name
}
output "rds_endpoint" {
  description = "Private RDS endpoint; no credentials."
  value       = aws_db_instance.main.address
}
output "artifact_bucket_name" {
  description = "Private S3 artifact bucket."
  value       = aws_s3_bucket.artifacts.bucket
}
output "route53_record_fqdn" {
  description = "Optional Route 53 record FQDN."
  value       = try(aws_route53_record.app[0].fqdn, null)
}
