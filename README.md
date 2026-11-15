<div align="center">
  <img src="https://raw.githubusercontent.com/core-ctrl/THE-ORBIT---FRONTEND/main/public/logo.png" alt="Orbit Logo" width="120" />
  <h1>Orbit Observability Platform</h1>
  
  <p>
    <b>The next-generation, cloud and hybrid observability and incident management platform.</b>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version" />
    <img src="https://img.shields.io/badge/Next.js-15.5-black.svg?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-18.3-blue.svg?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-Backend-009688.svg?logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
    <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status" />
  </p>
</div>

---

## 🧠 What is Orbit?

**Orbit** is an enterprise-grade, founder-level developer control plane designed to monitor, manage, and diagnose the health of your entire tech stack in real-time.

Built to compete with industry giants, Orbit gives you absolute control over your telemetry, analytics, and incident management—without vendor lock-in or resource bloat. It unifies application APM, host infrastructure metrics, Docker fleet management, and AI incident remediation into one high-performance interface.

---

## 🔥 What Makes Orbit Unique?

In the current open-source landscape, teams are forced to stitch together 4 to 5 fragmented point-solutions:
- **Prometheus + Grafana**: Great time-series charts, but complex YAML/PromQL configs and zero APM error tracking or container actionability.
- **Self-Hosted Sentry**: Comprehensive error tracking, but an enormous resource hog (requires 16GB+ RAM, ClickHouse, Kafka, PostgreSQL, Redis, MinIO) with no infrastructure monitoring.
- **Portainer**: Docker management without application telemetry or crash traces.
- **Uptime Kuma**: Standalone ping monitors without code-level diagnostics.

### 🌟 Core Differentiators

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ORBIT UNIFIED CONTROL PLANE                       │
├───────────────────┬───────────────────┬────────────────┬────────────────┤
│    APPLICATION    │  INFRASTRUCTURE   │     FLEET      │   AI COPILOT   │
│     TELEMETRY     │    MONITORING     │ ORCHESTRATION  │                │
│  (APM & Errors)   │  (CPU/RAM/Disk)   │ (Docker Logs & │   (Guardian    │
│                   │                   │   Lifecycle)   │  Diagnostics)  │
└───────────────────┴───────────────────┴────────────────┴────────────────┘
```

1. **Unified Observability + Actionable Orchestration ("See & Act")**:
   Most monitoring tools are strictly read-only. When a container spins out of memory or crashes in Orbit, you don't need to open a separate terminal to SSH into your server. You can view logs, inspect processes, and **restart, pause, exec, or terminate Docker containers directly from the incident screen**.

2. **Bidirectional SDK Control (Active Telemetry)**:
   Traditional monitoring is passive (apps blindly stream metrics outward). Orbit uses WebSocket and Redis Pub/Sub channels to communicate back to client SDKs in real-time. You can dynamically adjust trace sampling rates, activate debug mode, or toggle profiling on running production instances **without redeploying code**.

3. **Built-in AI "Guardian" Incident Copilot**:
   Orbit features **Guardian**, an integrated context-aware AI assistant. Guardian correlates application stack traces with live host telemetry (CPU spikes, memory exhaustion, container restarts) to explain the root cause and generate actionable code patches.

4. **Zero-Bloat, Lightweight Self-Hosting (< 1GB RAM Footprint)**:
   Unlike monolithic self-hosted monitoring stacks that consume 16GB–32GB of RAM, Orbit is built with **Next.js 15 + FastAPI + SQLite/PostgreSQL**, allowing it to boot on low-cost edge servers or local dev environments in seconds.

5. **In-Dashboard Developer IDE & Diagnostics**:
   Inspect stack traces, view relevant source files, and test environment parameters in-place through Orbit’s integrated editor view without switching context between browser tabs and IDEs.

---

## 📊 Comparison Matrix

| Capability | Sentry | Prometheus + Grafana | Portainer | Uptime Kuma | **Orbit** |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Application Crash Traces & APM** | ✅ | ❌ | ❌ | ❌ | **✅ Built-in** |
| **Host System Metrics (CPU/RAM/Disk)** | ❌ | ✅ | Limited | ❌ | **✅ Built-in** |
| **Docker Lifecycle Actions (Start/Stop/Logs)** | ❌ | ❌ | ✅ | ❌ | **✅ Built-in** |
| **Synthetic Uptime & Endpoint Probing** | ❌ | Manual Config | ❌ | ✅ | **✅ Built-in** |
| **Bidirectional SDK Runtime Config Push** | ❌ | ❌ | ❌ | ❌ | **✅ Built-in** |
| **AI Root-Cause Incident Copilot** | ❌ | ❌ | ❌ | ❌ | **✅ Guardian AI** |
| **Embedded IDE Code View** | ❌ | ❌ | ❌ | ❌ | **✅ Built-in** |
| **Low-Resource Footprint (< 1GB RAM)** | ❌ | ⚠️ Medium | ✅ | ✅ | **✅ High-Efficiency** |

---

## ✨ Features & Tech Stack

| Feature | Tech Used | Details |
| :--- | :--- | :--- |
| **Real-time Telemetry Feed** | WebSockets, Socket.IO | Zero-latency stream of application errors, performance anomalies, and traces. |
| **Bidirectional SDK Control** | FastAPI, Redis Pub/Sub | Push configuration updates to client SDKs without redeployment or restarts. |
| **High-Volume Ingestion** | Python, FastAPI, PostgreSQL | Dedicated telemetry processing pipeline for logs, traces, and metrics. |
| **Modern Dashboard UI** | Next.js 15, React 18, Tailwind CSS | Sleek glassmorphic interface, dark mode, keyboard shortcuts, and micro-animations. |
| **Interactive Performance Analytics** | Recharts, Lucide Icons | Real-time interactive charts representing system load, latency, and memory curves. |
| **Docker Fleet Management** | Docker Engine API | View container health, tail container logs, and execute lifecycle commands. |
| **AI Incident Copilot** | Orbit Guardian Engine | Conversational root-cause analysis and automated troubleshooting recommendations. |
| **Production Ready** | Docker, Docker Compose | Fully containerized architecture for single-command deployment. |

---

## 🚀 Quick Start

### 🖥️ Local Development (Frontend)

Orbit is designed to be lightweight and zero-config out of the box:

```bash
# Clone the repository
git clone https://github.com/core-ctrl/THE-ORBIT---FRONTEND.git

# Navigate to the frontend directory
cd THE-ORBIT---FRONTEND

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

### 🐳 Docker Deployment

Orbit is fully containerized. You can run the frontend connected to your backend instantly:

```bash
# Build the container image
docker build -t orbit-frontend .

# Run the container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-backend:8000/api/v1 orbit-frontend
```

---

## 🔒 Ecosystem & Architecture

Orbit is composed of four core pillars working in unison:

> [!IMPORTANT]  
> **Note:** The following backend repositories are currently maintained as private internal infrastructure to protect core backend logic and configuration engines.

- 🧠 **Orbit Backend** - High-performance FastAPI server handling the control plane, auth, and rate-limiting.
- 🔌 **Orbit SDKs** - Client libraries for Next.js, Node, Python, and Browser that hook into application lifecycles.
- 🔭 **Orbit Observability** - High-throughput processing pipeline for raw logs and traces.
- 💻 **Orbit Frontend** - This repository! The glassmorphism Next.js dashboard.

---

## 🤝 Rules and Regulations

We welcome feedback, issue reports, and community interactions! Please adhere to our guidelines:

1. **Security Disclosures:** If you discover a security vulnerability, please do not open a public issue. Email us privately first.
2. **Acceptable Use:** The Orbit platform is intended for authorized application monitoring and telemetry management. Do not use our SDKs for unauthorized tracking or data harvesting.
3. **Respectful Communication:** Please follow our Code of Conduct. We maintain a zero-tolerance policy for harassment or toxic behavior.

---

## 📄 License

This project is open-sourced software licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.

Copyright (c) 2026 Core-Ctrl

*Disclaimer: Orbit provides a platform for infrastructure monitoring. Ensure you comply with all local privacy laws (like GDPR/CCPA) when collecting user telemetry data.*
