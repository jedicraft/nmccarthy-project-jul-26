terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project
  region  = var.region
}

data "google_project" "current" {
  project_id = var.gcp_project
}

locals {
  bucket_name = "${var.project_prefix}-static"
}

# Static site bucket (PWA build artifacts deployed by CI/CD)
resource "google_storage_bucket" "static" {
  name          = local.bucket_name
  location      = var.region
  force_destroy = true

  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Placeholder until Harness deploy-gcs stage publishes the PWA build
resource "google_storage_bucket_object" "index" {
  name         = "index.html"
  content      = <<-HTML
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Solitiare</title>
      </head>
      <body>
        <p>Solitiare PWA — awaiting first CI/CD deploy.</p>
      </body>
    </html>
  HTML
  content_type = "text/html"
  bucket       = google_storage_bucket.static.name
}

# Allow Cloud Load Balancing backend bucket to serve objects
resource "google_storage_bucket_iam_member" "lb_object_viewer" {
  bucket = google_storage_bucket.static.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:service-${data.google_project.current.number}@compute-system.iam.gserviceaccount.com"
}

resource "google_compute_backend_bucket" "static" {
  name        = "${var.project_prefix}-backend"
  bucket_name = google_storage_bucket.static.name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    default_ttl       = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
  }
}

resource "google_compute_url_map" "static" {
  name            = "${var.project_prefix}-url-map"
  default_service = google_compute_backend_bucket.static.id

  host_rule {
    hosts        = [var.domain_name]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_bucket.static.id
  }
}

resource "google_compute_managed_ssl_certificate" "static" {
  name = "${var.project_prefix}-cert"

  managed {
    domains = [var.domain_name]
  }
}

resource "google_compute_target_https_proxy" "static" {
  name             = "${var.project_prefix}-https-proxy"
  url_map          = google_compute_url_map.static.id
  ssl_certificates = [google_compute_managed_ssl_certificate.static.id]
}

resource "google_compute_global_address" "static" {
  name = "${var.project_prefix}-ip"
}

resource "google_compute_global_forwarding_rule" "https" {
  name                  = "${var.project_prefix}-https-rule"
  ip_address            = google_compute_global_address.static.address
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL"
  port_range            = "443"
  target                = google_compute_target_https_proxy.static.id
}

# HTTP -> HTTPS redirect
resource "google_compute_url_map" "http_redirect" {
  name = "${var.project_prefix}-http-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "http_redirect" {
  name    = "${var.project_prefix}-http-proxy"
  url_map = google_compute_url_map.http_redirect.id
}

resource "google_compute_global_forwarding_rule" "http" {
  name                  = "${var.project_prefix}-http-rule"
  ip_address            = google_compute_global_address.static.address
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL"
  port_range            = "80"
  target                = google_compute_target_http_proxy.http_redirect.id
}
