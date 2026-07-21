variable "project_prefix" {
  description = "Prefix for GCP resource names (bucket, LB, SSL cert)."
  type        = string
  default     = "nmccarthy-project-jul-26"
}

variable "gcp_project" {
  description = "GCP project ID."
  type        = string
  default     = "sales-209522"
}

variable "region" {
  description = "GCP region for provider defaults."
  type        = string
  default     = "us-central1"
}

variable "domain_name" {
  description = "Custom domain for managed SSL certificate and HTTPS load balancer (DNS A record -> load_balancer_ip)."
  type        = string
  default     = "nmccarthy-project-jul-26.example.com"
}
