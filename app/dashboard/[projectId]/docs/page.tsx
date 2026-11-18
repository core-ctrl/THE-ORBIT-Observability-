"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Terminal, 
  Copy, 
  Check, 
  Code2, 
  Server, 
  Cpu, 
  Globe, 
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function DocsPage({ params }: { params?: Promise<{ projectId: string }> }) {
  const [activeTab, setActiveTab] = useState<"nextjs" | "python" | "node" | "agent" | "api">("nextjs");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const nextjsInstall = `npm install orbit-observability
# or
pnpm add orbit-observability`;

  const nextjsInit = `// app/layout.tsx or pages/_app.tsx
import { initOrbit, OrbitErrorBoundary } from "orbit-observability";

initOrbit({
  dsn: "http://localhost:8000/ingest/YOUR_PROJECT_KEY",
  endpoint: "http://localhost:8000",
  environment: process.env.NODE_ENV || "production",
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OrbitErrorBoundary>
          {children}
        </OrbitErrorBoundary>
      </body>
    </html>
  );
}`;

  const pythonInstall = `pip install orbit-sdk
# or install local development package:
pip install -e C:\\Orbit-SDKs\\orbit-python`;

  const pythonInit = `import orbit_python

orbit_python.init(
    dsn="http://localhost:8000/ingest/YOUR_PROJECT_KEY",
    endpoint="http://localhost:8000",
    environment="production",
    release="v1.0.4"
)

# Optional: Add custom breadcrumbs and user context
orbit_python.set_user({"id": "usr_942", "email": "dev@company.com"})
orbit_python.add_breadcrumb(category="auth", message="User session verified")

# Exceptions are captured automatically:
try:
    risky_database_operation()
except Exception as e:
    orbit_python.capture_exception(e, extra={"query_timeout_ms": 5000})`;

  const nodeInstall = `npm install orbit-observability`;

  const nodeInit = `const { init, captureException, startSpan } = require("orbit-observability");

init({
  dsn: "http://localhost:8000/ingest/YOUR_PROJECT_KEY",
  endpoint: "http://localhost:8000",
  serviceName: "payment-gateway",
  environment: "production",
});

// Express.js Error Middleware
app.use((err, req, res, next) => {
  captureException(err, {
    tags: { route: req.path, method: req.method },
  });
  res.status(500).json({ error: "Internal Server Error" });
});`;

  const agentInstall = `# 1. Pull and run the Orbit Host Agent container:
docker run -d \\
  --name orbit-agent \\
  --restart always \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -e ORBIT_DSN="YOUR_PROJECT_KEY" \\
  -e ORBIT_ENDPOINT="http://localhost:8000" \\
  orbit-agent:latest`;

  const agentPython = `# Or run directly with Python:
cd C:\\Orbit-SDKs\\orbit-agent
pip install -r requirements.txt
$env:ORBIT_DSN="YOUR_PROJECT_KEY"
$env:ORBIT_ENDPOINT="http://localhost:8000"
py agent.py`;

  const apiEndpoints = `// 1. Ingest Unhandled Exception
POST http://localhost:8000/ingest/v1/events
Content-Type: application/json

{
  "api_key": "YOUR_PROJECT_KEY",
  "type": "UnhandledException",
  "message": "NullPointerException: Cannot read field 'token'",
  "level": "error",
  "environment": "production",
  "stack_trace": "java.lang.NullPointerException at com.orbit.service.Auth...",
  "runtime": { "platform": "jvm", "version": "21" }
}

// 2. Report Host Agent Metrics
POST http://localhost:8000/ingest/v1/events
{
  "api_key": "YOUR_PROJECT_KEY",
  "type": "AgentMetrics",
  "runtime": {
    "cpu_percent": 18.4,
    "memory_percent": 62.1,
    "disk_percent": 44.0
  }
}`;

  return (
    <div className="space-y-8 max-w-5xl text-white animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Documentation & SDK Integration
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <BookOpen className="h-4 w-4" />
              </span>
              Developer SDK Hub
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              5 CLIENTS
            </span>
          </div>
        </div>
      </div>

      {/* SDK Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {[
          { id: "nextjs", name: "Next.js & React", icon: Code2 },
          { id: "python", name: "Python & FastAPI", icon: Terminal },
          { id: "node", name: "Node.js & Express", icon: Layers },
          { id: "agent", name: "Host & Docker Agent", icon: Server },
          { id: "api", name: "REST Telemetry API", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition ${
                isActive
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Next.js */}
      {activeTab === "nextjs" && (
        <div className="space-y-6">
          <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2.5">
              <span className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold font-mono">1</span>
              <span>Install the Orbit Next.js SDK</span>
            </h2>
            <div className="relative">
              <pre className="bg-black p-4 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto border border-white/10">
                {nextjsInstall}
              </pre>
              <button
                onClick={() => handleCopy(nextjsInstall, "next_inst")}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 bg-zinc-900 border border-white/15 rounded-lg transition"
              >
                {copiedKey === "next_inst" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>

          <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2.5">
              <span className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold font-mono">2</span>
              <span>Initialize Orbit in Root Layout</span>
            </h2>
            <div className="relative">
              <pre className="bg-black p-4 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto border border-white/10 leading-relaxed">
                {nextjsInit}
              </pre>
              <button
                onClick={() => handleCopy(nextjsInit, "next_init")}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 bg-zinc-900 border border-white/15 rounded-lg transition"
              >
                {copiedKey === "next_init" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Python */}
      {activeTab === "python" && (
        <div className="space-y-6">
          <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2.5">
              <span className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold font-mono">1</span>
              <span>Install Python Observability SDK</span>
            </h2>
            <div className="relative">
              <pre className="bg-black p-4 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto border border-white/10">
                {pythonInstall}
              </pre>
              <button
                onClick={() => handleCopy(pythonInstall, "py_inst")}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 bg-zinc-900 border border-white/15 rounded-lg transition"
              >
                {copiedKey === "py_inst" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>

          <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2.5">
              <span className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold font-mono">2</span>
              <span>Configure Exception Interceptors & Context</span>
            </h2>
            <div className="relative">
              <pre className="bg-black p-4 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto border border-white/10 leading-relaxed">
                {pythonInit}
              </pre>
              <button
                onClick={() => handleCopy(pythonInit, "py_init")}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 bg-zinc-900 border border-white/15 rounded-lg transition"
              >
                {copiedKey === "py_init" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: Node.js */}
      {activeTab === "node" && (
        <div className="space-y-6">
          <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2.5">
              <span className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold font-mono">1</span>
              <span>Install Node.js Package</span>
            </h2>
            <div className="relative">
              <pre className="bg-black p-4 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto border border-white/10">
                {nodeInstall}
              </pre>
              <button
                onClick={() => handleCopy(nodeInstall, "node_inst")}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 bg-zinc-900 border border-white/15 rounded-lg transition"
              >
                {copiedKey === "node_inst" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>

          <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2.5">
              <span className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold font-mono">2</span>
              <span>Express.js Middleware Setup</span>
            </h2>
            <div className="relative">
              <pre className="bg-black p-4 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto border border-white/10 leading-relaxed">
                {nodeInit}
              </pre>
              <button
                onClick={() => handleCopy(nodeInit, "node_init")}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 bg-zinc-900 border border-white/15 rounded-lg transition"
              >
                {copiedKey === "node_init" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Tab 4: Agent */}
      {activeTab === "agent" && (
        <div className="space-y-6">
          <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-white" />
              <span>Deploy Orbit Infrastructure Daemon Container</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Streams Docker container events, CPU metrics, memory stats, and disk allocations to your Orbit control plane.
            </p>
            <div className="relative">
              <pre className="bg-black p-4 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto border border-white/10 leading-relaxed">
                {agentInstall}
              </pre>
              <button
                onClick={() => handleCopy(agentInstall, "agent_inst")}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 bg-zinc-900 border border-white/15 rounded-lg transition"
              >
                {copiedKey === "agent_inst" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>

          <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-white" />
              <span>Native Host Agent Execution</span>
            </h2>
            <div className="relative">
              <pre className="bg-black p-4 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto border border-white/10 leading-relaxed">
                {agentPython}
              </pre>
              <button
                onClick={() => handleCopy(agentPython, "agent_py")}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 bg-zinc-900 border border-white/15 rounded-lg transition"
              >
                {copiedKey === "agent_py" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Tab 5: REST API */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <section className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-white" />
              <span>REST Telemetry Ingestion Contract</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Use standard HTTP requests to emit events from languages without dedicated SDK packages (Go, Rust, Ruby, Elixir).
            </p>
            <div className="relative">
              <pre className="bg-black p-4 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto border border-white/10 leading-relaxed">
                {apiEndpoints}
              </pre>
              <button
                onClick={() => handleCopy(apiEndpoints, "api_spec")}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1.5 bg-zinc-900 border border-white/15 rounded-lg transition"
              >
                {copiedKey === "api_spec" ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
