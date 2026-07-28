# Solitiare

Klondike solitaire PWA built with React, Vite, and TypeScript. Deployed to local **Rancher Desktop Kubernetes** via Harness CI/CD.

## Naming convention

All project resources share the prefix **`nmccarthy-project-jul-26`**:

| Resource | Name |
|----------|------|
| K8s namespace | `nmccarthy-project-jul-26` |
| Docker image | `mccarthyharness/nmccarthy-project-jul-26` |
| Harness pipeline | `nmccarthy-project-jul-26-ci-cd` |
| GitHub repo | `jedicraft/nmccarthy-project-jul-26` |

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

### Local Docker

```bash
docker build -t nmccarthy-project-jul-26:local .
docker run --rm -p 8080:80 nmccarthy-project-jul-26:local
```

Open http://localhost:8080

### Local Kubernetes (Rancher Desktop)

```bash
kubectl apply -f k8s/
kubectl get pods -n nmccarthy-project-jul-26
```

App is exposed on **NodePort 30080**: http://localhost:30080

## PWA install

After deploying to HTTPS (or localhost for basic testing):

1. Open the app in Chrome or Edge.
2. Use the **Install** button in the app or browser menu → **Install Solitaire**.
3. Safari (iOS): Share → **Add to Home Screen**.

## Harness CI/CD

Pipeline definition: [`.harness/pipeline.yaml`](.harness/pipeline.yaml)

| Setting | Value |
|---------|-------|
| Account | `EeRjnXTnS4GrLG5VNNJZUw` |
| Organization | `sandbox` |
| Project | `NMcCarthy_Sandbox` |

**Connectors**

| Connector | Purpose |
|-----------|---------|
| `jedicraftGitHub` | Clone `jedicraft/nmccarthy-project-jul-26` |
| `nmccarthydockerdesktoplaptop` | Build and push Docker image |
| `NJMK8sLocalRancherDesktop` | Deploy to Rancher Desktop K8s |

**Stages**

1. **test** — Harness Cloud: `npm ci`, `npm test`
2. **deploy k8s** — KubernetesDirect on Rancher Desktop: Docker build/push, `kubectl apply -f k8s/`

[Open pipeline in Harness](https://app.harness.io/ng/account/EeRjnXTnS4GrLG5VNNJZUw/all/orgs/sandbox/projects/NMcCarthy_Sandbox/pipelines/nmccarthy_project_jul_26_ci_cd/pipeline-studio)

## Legacy GCP infra

The `infra/` Terraform module (GCS + CDN) is **deprecated** and not used for current deployments.

## Card logo

Replace `public/assets/cards/logo.svg` with your logo (used on card backs and PWA icons).
