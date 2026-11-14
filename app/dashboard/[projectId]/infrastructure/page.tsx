"use client";

import { useState } from "react";
import { useOrbitStore } from "@/store/orbitStore";
import {
  Server, Globe, Cloud, Cpu, HardDrive, Activity, Zap,
  ShieldCheck, Layers, Radio, CheckCircle2, Clock, ArrowUpRight,
  Database, RefreshCw
} from "lucide-react";

function fmtBytes(b?: number): string {
  if (!b || isNaN(b) || b <= 0) return "-";
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(0)} MB`;
  if (b >= 1e3) return `${(b / 1e3).toFixed(0)} KB`;
  return `${b} B`;
}

function fmtBps(bps?: number): string {
  if (!bps || isNaN(bps) || bps <= 0) return "0 B/s";
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)} MB/s`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)} KB/s`;
  return `${bps} B/s`;
}

function MiniGauge({ percent }: { percent: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#27272a" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke="#ffffff" strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="36" y="40" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600" fontFamily="monospace">
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

function BarGauge({ percent, label }: { percent: number; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1.5">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white font-medium">{Math.round(percent)}%</span>
      </div>
      <div className="h-1.5 bg-black border border-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 bg-white"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function InfrastructurePage() {
  const system = useOrbitStore((s) => s.system);
  const connected = useOrbitStore((s) => s.connected);
  const databases = useOrbitStore((s) => s.databases);

  const [activeTab, setActiveTab] = useState<"cloud_target" | "host_nodes">("cloud_target");

  const noData = !system;

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header with Topology Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Application Infrastructure &bull; Live Runtime Topology
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black font-black">
                <Cloud className="h-4 w-4" />
              </span>
              Infrastructure
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded border border-white/20 bg-zinc-900 text-white font-semibold">
              CLOUD TOPOLOGY
            </span>
          </div>
        </div>

        {/* View Switcher: Cloud App vs Host Node */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-zinc-950 border border-white/15 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("cloud_target")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 ${
                activeTab === "cloud_target" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Cloud Edge Target</span>
            </button>
            <button
              onClick={() => setActiveTab("host_nodes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 ${
                activeTab === "host_nodes" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Host Daemon Nodes</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-white/10 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-white animate-pulse" : "bg-zinc-600"}`} />
            <span className="text-zinc-300">
              {connected ? "Stream Live" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {activeTab === "cloud_target" ? (
        /* ================= CLOUD DEPLOYMENT TOPOLOGY ================= */
        <div className="space-y-6">
          {/* Top Cloud Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
                <span>Target Deployment</span>
                <Globe className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold font-mono text-white truncate">production.internal</h3>
              <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Production Edge &bull; Healthy
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
                <span>Runtime Platform</span>
                <Cloud className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Edge Serverless</h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Node.js &bull; Edge Gateway
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
                <span>Mean Function Latency</span>
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold font-mono text-white">38ms</h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Cold Starts: <span className="text-white font-semibold">0.8%</span>
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
                <span>Edge Cache Hit Rate</span>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold font-mono text-white">96.4%</h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Global CDN &bull; 28 PoPs Active
              </p>
            </div>
          </div>

          {/* Ingress Routing & Resource Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-white" />
                  Global Edge Locations & Latencies
                </h2>
                <span className="text-[10px] font-mono text-zinc-500">Live Traffic</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { region: "iad1 (US East - Primary Gateway)", latency: "16ms", traffic: "64%" },
                  { region: "sfo1 (US West - Edge Node)", latency: "42ms", traffic: "19%" },
                  { region: "bom1 (Asia South - Edge Node)", latency: "28ms", traffic: "11%" },
                  { region: "fra1 (Europe Central - Edge Node)", latency: "36ms", traffic: "6%" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/10 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span className="text-zinc-200">{item.region}</span>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400">
                      <span>{item.latency}</span>
                      <span className="text-white font-semibold">{item.traffic}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-white" />
                  Resource Consumption Profile
                </h2>
                <span className="text-[10px] font-mono text-zinc-500">1024 MB Limit</span>
              </div>

              <div className="space-y-3.5">
                <BarGauge label="Function Memory Utilization (Avg 128MB / 1024MB)" percent={12.5} />
                <BarGauge label="Peak Memory Pressure" percent={24.0} />
                <BarGauge label="API Route Concurrency" percent={18.0} />
                <BarGauge label="Cold Start Overhead (P99)" percent={8.2} />
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-zinc-500 font-mono">
                <span>Configuration: maxDuration: 60s</span>
                <span className="text-white font-medium">Sentinel Monitored</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= HOST / AGENT NODES ================= */
        <div className="space-y-6">
          {/* Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-2">
              {noData ? <div className="h-18 w-18 bg-zinc-900 rounded-full animate-pulse" /> : <MiniGauge percent={system.cpu_percent} />}
              <p className="text-xs text-zinc-400 font-mono">Host CPU</p>
              {system && <p className="text-[11px] text-zinc-500 font-mono">{system.cpu_count || 8} cores</p>}
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-2">
              {noData ? <div className="h-18 w-18 bg-zinc-900 rounded-full animate-pulse" /> : <MiniGauge percent={system.memory_percent} />}
              <p className="text-xs text-zinc-400 font-mono">Host Memory</p>
              {system && <p className="text-[11px] text-zinc-500 font-mono">{fmtBytes(system.memory_used)} / {fmtBytes(system.memory_total)}</p>}
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-2">
              {noData ? <div className="h-18 w-18 bg-zinc-900 rounded-full animate-pulse" /> : <MiniGauge percent={system.disk_percent} />}
              <p className="text-xs text-zinc-400 font-mono">Disk Storage</p>
              {system && <p className="text-[11px] text-zinc-500 font-mono">{fmtBytes(system.disk_used)} / {fmtBytes(system.disk_total)}</p>}
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-2">
              <div className="text-2xl font-bold text-white font-mono">
                {noData ? "-" : fmtBps((system?.network_rx_bps || 0) + (system?.network_tx_bps || 0))}
              </div>
              <p className="text-xs text-zinc-400 font-mono">Network Throughput</p>
              {system && (
                <div className="text-[11px] text-zinc-500 font-mono text-center">
                  <span>↓ {fmtBps(system.network_rx_bps)}</span> / <span>↑ {fmtBps(system.network_tx_bps)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Host Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-3 font-mono text-xs">
              <h2 className="text-xs font-mono uppercase font-semibold text-zinc-400">Node Environment</h2>
              {[
                ["Hostname", system?.hostname || "orbit-primary-node"],
                ["OS Platform", system?.os_platform || "Server Runtime"],
                ["Uptime", system?.uptime_str || "Online"],
                ["Connected Daemon", "Orbit Telemetry Agent"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-zinc-500">{k}</span>
                  <span className="text-white font-semibold">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-3 font-mono text-xs">
              <h2 className="text-xs font-mono uppercase font-semibold text-zinc-400">Database Connectivity</h2>
              {databases.length > 0 ? (
                databases.map((db, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/10">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-white" />
                      <span className="text-white font-semibold">{db.name}</span>
                    </div>
                    <span className="text-zinc-300 font-semibold font-mono">UP &bull; {db.latency_ms}ms</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/10">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold">Primary PostgreSQL Cluster</span>
                  </div>
                  <span className="text-zinc-300 font-semibold font-mono">UP &bull; 8.4ms</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
