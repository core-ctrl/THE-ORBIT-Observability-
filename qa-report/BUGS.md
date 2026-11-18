# Comprehensive Defect & Resolution Log (BUGS.md)

| Bug ID | Title | Severity | Category | Status | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ORB-QA-001** | Missing Org Status Page Config Endpoint (`/organizations/{id}/status`) | **P2 – Medium** | Backend Integration | **RESOLVED** | Verified `GET /api/v1/organizations/{id}/status` returns 200 OK |
| **ORB-QA-002** | Missing Favicon Static Asset Returns HTTP 404 | **P3 – Low** | Static Assets | **RESOLVED** | Created branded SVG & ICO in `app/icon.svg` & `public/favicon.ico` |
| **ORB-QA-003** | Missing Accessible `aria-label` Attributes on Icon Buttons | **P3 – Low** | Accessibility (WCAG) | **RESOLVED** | Added explicit `aria-label` and `title` attributes across action buttons |
| **ORB-QA-004** | Project Creation Wizard Step 1 Missing Explicit Bottom Cancel Button | **P4 – Info** | Usability / UX Flow | **RESOLVED** | Added secondary Cancel button and dismiss hotkeys |
| **ORB-QA-005** | Missing Docker Container Action Handler (`POST /docker/containers/{id}/{action}`) | **P2 – Medium** | Container Ops | **RESOLVED** | Implemented container start/stop/restart controller in `InfraController.java` |
| **ORB-QA-006** | Missing Project Integrations Endpoints (`/projects/{id}/integrations`) | **P2 – Medium** | Webhooks / Settings | **RESOLVED** | Implemented GET, POST, DELETE integration handlers in `ProjectController.java` |
| **ORB-QA-007** | Missing Workspace Backup Export & Import Endpoints (`/export`, `/import`) | **P2 – Medium** | Data Management | **RESOLVED** | Implemented JSON backup export and import in `ProjectController.java` |
| **ORB-QA-008** | Missing GitHub README Status Badge Endpoint (`/badge.svg`) | **P3 – Low** | External Integration | **RESOLVED** | Implemented dynamic vector SVG badge generator in `ProjectController.java` |
| **ORB-QA-009** | Missing Organization Audit Logs Endpoint (`/audit-logs`) | **P3 – Low** | Compliance / Audit | **RESOLVED** | Implemented audit log event provider in `ProjectController.java` |

---

## Detailed Resolutions

### [ORB-QA-001] Org Status Page Config Endpoint
- **Resolution:** Added `@GetMapping("/organizations/{orgId}/status")` and `@RequestMapping(value = "/organizations/{orgId}/status", method = {POST, PUT})` in `ProjectController.java`. Added resilient fallback state in `app/settings/organization/page.tsx`.
- **Status:** **Verified (HTTP 200 OK)**

### [ORB-QA-002] Missing Favicon Asset
- **Resolution:** Generated high-resolution vector `icon.svg` with Orbit neon ring motif and placed it in `app/icon.svg`, `public/icon.svg`, and `public/favicon.ico`.
- **Status:** **Verified (HTTP 200 OK)**

### [ORB-QA-003] Missing `aria-label` Attributes
- **Resolution:** Updated `app/dashboard/[projectId]/projects/page.tsx` with explicit `aria-label` and `title` attributes on all icon-only buttons (`RefreshCw`, `Trash2`, `X`).
- **Status:** **Verified (WCAG 2.1 AA compliant)**

### [ORB-QA-004] Project Wizard Modal Dismiss UX
- **Resolution:** Ensured secondary "Cancel" button is explicitly positioned in Step 1 alongside the primary "Generate SDK Key & Continue" action.
- **Status:** **Verified**

### [ORB-QA-005] Docker Container Lifecycle Actions
- **Resolution:** Added `@PostMapping("/api/v1/docker/containers/{id}/{action}")` in `InfraController.java` to support starting, stopping, and restarting containers from the Docker dashboard.
- **Status:** **Verified (HTTP 200 OK)**

### [ORB-QA-006] Project Integrations & Webhooks
- **Resolution:** Implemented `@GetMapping`, `@PostMapping`, and `@DeleteMapping` on `/api/v1/projects/{projectId}/integrations` in `ProjectController.java` to allow configuring Slack, Discord, and custom webhooks.
- **Status:** **Verified (HTTP 200 OK)**

### [ORB-QA-007] Workspace Backup Export & Import
- **Resolution:** Implemented `/api/v1/projects/{projectId}/export` and `/api/v1/projects/{projectId}/import` in `ProjectController.java`, enabling complete JSON backup downloads and restoration.
- **Status:** **Verified (HTTP 200 OK)**

### [ORB-QA-008] GitHub README Live Status Badge
- **Resolution:** Implemented `@GetMapping(value = "/projects/{projectId}/badge.svg", produces = "image/svg+xml")` in `ProjectController.java` serving embeddable status shields.
- **Status:** **Verified (HTTP 200 OK)**

### [ORB-QA-009] Organization Audit Logs
- **Resolution:** Implemented `@GetMapping("/organizations/{orgId}/audit-logs")` in `ProjectController.java` providing structured audit trail telemetry.
- **Status:** **Verified (HTTP 200 OK)**
