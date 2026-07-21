# Solitiare

Klondike solitaire PWA built with React, Vite, and TypeScript. Infrastructure and CI/CD target GCP static hosting with Harness.

## Naming convention

All project resources share the prefix **`nmccarthy-project-jul-26`**:

| Resource | Name |
|----------|------|
| GCS bucket | `nmccarthy-project-jul-26-static` |
| Harness pipeline | `nmccarthy-project-jul-26-ci-cd` |
| GitHub repo | `jedicraft/nmccarthy-project-jul-26` |
| Terraform `project_prefix` | `nmccarthy-project-jul-26` (default) |
| GCP project | `sales-209522` |

Override Terraform defaults in `infra/variables.tf` or via `-var` flags.

## Local development

```bash
npm ci
npm run dev
```

Open the Vite dev server URL (typically `http://localhost:5173`).

### Other scripts

```bash
npm test          # Vitest unit tests
npm run build     # Production build -> dist/
npm run preview   # Preview production build locally
npm run lint      # oxlint
```

## PWA install

After deploying to HTTPS (required for service workers):

1. Open the app at your configured domain (see `infra/` Terraform `domain_name`).
2. **Chrome / Edge:** Install icon in the address bar, or menu → **Install Solitiare**.
3. **Safari (iOS):** Share → **Add to Home Screen**.
4. **Firefox:** Menu → **Install**.

Local PWA testing: run `npm run build && npm run preview` and use the preview HTTPS URL if configured, or test install behavior after the first GCS deploy.

## Infrastructure (GCP)

Terraform in `infra/` provisions:

- GCS bucket `nmccarthy-project-jul-26-static` with website config (`index.html` main page)
- Backend bucket with **Cloud CDN**
- Global **HTTPS load balancer** with **Google-managed SSL**
- HTTP → HTTPS redirect

```bash
cd infra
terraform init
terraform plan
terraform apply
```

Set `domain_name` (variable or `-var 'domain_name=your.domain.com'`) and point its DNS **A record** to the `load_balancer_ip` output. SSL provisioning completes after DNS propagates.

## Harness CI/CD

Pipeline definition: [`.harness/pipeline.yaml`](.harness/pipeline.yaml)

| Setting | Value |
|---------|-------|
| Account | `EeRjnXTnS4GrLG5VNNJZUw` |
| Organization | `Sandbox` |
| Project | `NMcCarthy_Sandbox` |

**Connectors**

- `jedicraftGitHub` — GitHub (`jedicraft/nmccarthy-project-jul-26`)
- `NMcCarthy-Sandbox-GCP` — GCP deploy to `nmccarthy-project-jul-26-static`

**Stages**

1. **test-and-build** — `npm ci`, `npm test`, `npm run build`
2. **deploy-gcs** — `uploadArtifactsToGCS` uploads `dist/**` to the static bucket (main branch only)

Import or create the pipeline in Harness from `.harness/pipeline.yaml` scoped to the project above.

## Workflow: logo before first push

Add your app logo (PWA icons and any branding assets) **before the first push to `main`**. The initial deploy publishes `dist/` to GCS; missing icons are harder to fix cleanly after users install the PWA from cache/CDN.

Suggested locations once PWA plugin is configured:

- `public/icon-192.png`, `public/icon-512.png` (or paths referenced in the Vite PWA manifest)

Commit logo assets, then push to trigger CI/CD.
