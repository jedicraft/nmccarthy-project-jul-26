output "gcs_bucket_name" {
  description = "GCS bucket for static PWA assets."
  value       = google_storage_bucket.static.name
}

output "gcs_bucket_url" {
  description = "Direct GCS website endpoint (use HTTPS LB URL in production)."
  value       = "https://storage.googleapis.com/${google_storage_bucket.static.name}/index.html"
}

output "load_balancer_ip" {
  description = "Global HTTPS load balancer IP — point domain_name DNS A record here."
  value       = google_compute_global_address.static.address
}

output "https_url" {
  description = "PWA URL served over HTTPS with managed SSL and Cloud CDN."
  value       = "https://${var.domain_name}"
}

output "ssl_certificate_name" {
  description = "Google-managed SSL certificate resource name."
  value       = google_compute_managed_ssl_certificate.static.name
}

output "backend_bucket_name" {
  description = "Backend bucket used by the global load balancer."
  value       = google_compute_backend_bucket.static.name
}
