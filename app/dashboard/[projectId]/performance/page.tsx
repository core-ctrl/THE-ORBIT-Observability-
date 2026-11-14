"use client";

import { useEffect, useState, useCallback, useMemo, use } from "react";
import { useOrbitStore } from "@/store/orbitStore";
import { useEndpoints } from "@/hooks/useEndpoints";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, Plus, Clock, Cpu, Heart, CheckCircle2, Zap, Gauge } from "lucide-react";
import { api, ingest } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

function fmtBytes(b: number): string {
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(0)} MB`;
  return `${b} B`;
}

function fmtBps(bps: number): string {
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)} MB/s`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)} KB/s`;
  return `${bps} B/s`;
}

export default function PerformancePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  useEndpoints();

  // Tab State
  const [perfTab, setPerfTab] = useState<"system" | "apm">("system");

  // System States (Zustand store)
  const system = useOrbitStore((s) => s.system);
  const systemHistory = useOrbitStore((s) => s.systemHistory);
  const endpoints = useOrbitStore((s) => s.endpoints);
  const connected = useOrbitStore((s) => s.connected);

  const cpuHistory = useMemo(() => systemHistory.map((s) => s.cpu_percent), [systemHistory]);
  const ramHistory = useMemo(() => systemHistory.map((s) => s.memory_percent), [systemHistory]);

  // APM States
  const [apmStats, setApmStats] = useState<any>({
    apdex: 1.0,
    avg_duration_ms: 0.0,
    throughput_rpm: 0.0,
    error_rate: 0.0,
    slowest: [],
    web_vitals_avg: { lcp: 0.0, fid: 0.0, cls: 0.0 }
  });
  const [loadingApm, setLoadingApm] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const fetchApmStats = useCallback(async () => {
    setLoadingApm(true);
    try {
      const data = await api.apm(projectId);
      setApmStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApm(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (perfTab === "apm") {
      fetchApmStats();
    }
  }, [perfTab, projectId]);

  // Emit test APM trace
  const handleSimulateTrace = async () => {
    setSimulating(true);
    try {
      const project = await api.project(projectId);
      const dsn_key = project.dsn_key || project.dsnKey;
      if (!dsn_key) return;

      const endpoints_list = [
        "GET /api/v1/users",
        "POST /api/v1/checkout",
        "GET /api/v1/products",
        "GET /api/v1/issues"
      ];
      const randomName = endpoints_list[Math.floor(Math.random() * endpoints_list.length)];
      const randomDuration = Math.random() * 800 + 50;
      const randomStatus = Math.random() > 0.05 ? 200 : 500;
      
      await ingest.performance(dsn_key, {
        name: randomName,
        type: "request",
        duration_ms: randomDuration,
        status_code: randomStatus,
        web_vitals: {
          lcp: Math.random() * 2.5 + 0.5,
          fid: Math.random() * 100,
          cls: Math.random() * 0.15
        }
      });

      if (perfTab === "apm") {
        fetchApmStats();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Telemetry & APM Throughput
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <Gauge className="h-4 w-4" />
              </span>
              Performance
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {perfTab === "system" ? "HOST METRICS" : "APM PROFILER"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {perfTab === "apm" && (
            <>
              <button
                onClick={handleSimulateTrace}
                disabled={simulating}
                className="bg-white text-black hover:bg-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{simulating ? "Tracing..." : "Simulate Trace"}</span>
              </button>
              <button
                onClick={fetchApmStats}
                className="bg-zinc-950 border border-white/15 hover:border-white/30 text-white p-2 rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <div className="flex bg-zinc-950 border border-white/15 p-1 rounded-xl">
            <button
              onClick={() => setPerfTab("system")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                perfTab === "system" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Host System
            </button>
            <button
              onClick={() => setPerfTab("apm")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                perfTab === "apm" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Application APM
            </button>
          </div>
        </div>
      </div>

      {perfTab === "system" ? (
        // HOST SYSTEM METRICS VIEW
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-mono text-zinc-400 mb-1">CPU Load</p>
              <p className="text-2xl font-bold font-mono text-white">{system ? `${system.cpu_percent.toFixed(1)}%` : "—"}</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">{system ? `${system.cpu_count} compute cores` : "Waiting for telemetry"}</p>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-mono text-zinc-400 mb-1">Memory Allocation</p>
              <p className="text-2xl font-bold font-mono text-white">{system ? `${system.memory_percent.toFixed(1)}%` : "—"}</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">{system ? `${fmtBytes(system.memory_used)} used` : "Waiting for telemetry"}</p>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-mono text-zinc-400 mb-1">Active Endpoints</p>
              <p className="text-2xl font-bold font-mono text-white">{endpoints.length}</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">{endpoints.filter(e => e.status === "up").length} operational</p>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-mono text-zinc-400 mb-1">Network I/O Throughput</p>
              <p className="text-2xl font-bold font-mono text-white">{system ? fmtBps(system.network_rx_bps + system.network_tx_bps) : "—"}</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">↓ {system ? fmtBps(system.network_rx_bps) : "0"} ↑ {system ? fmtBps(system.network_tx_bps) : "0"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <h2 className="text-xs font-mono uppercase font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-white" /> CPU Utilization Timeline
              </h2>
              <div className="h-20 flex items-end gap-1 bg-black p-2 rounded-xl border border-white/10">
                {cpuHistory.length === 0 ? (
                  <div className="w-full text-center text-xs font-mono text-zinc-600 self-center">Awaiting data</div>
                ) : (
                  cpuHistory.map((val, i) => (
                    <div key={i} className="flex-1 bg-white rounded-t transition-all" style={{ height: `${val}%`, minHeight: "2px" }} />
                  ))
                )}
              </div>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <h2 className="text-xs font-mono uppercase font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" /> RAM Utilization Timeline
              </h2>
              <div className="h-20 flex items-end gap-1 bg-black p-2 rounded-xl border border-white/10">
                {ramHistory.length === 0 ? (
                  <div className="w-full text-center text-xs font-mono text-zinc-600 self-center">Awaiting data</div>
                ) : (
                  ramHistory.map((val, i) => (
                    <div key={i} className="flex-1 bg-zinc-300 rounded-t transition-all" style={{ height: `${val}%`, minHeight: "2px" }} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // APPLICATION APM VIEW
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-mono text-zinc-400 mb-1">Apdex Index</p>
              <p className="text-2xl font-bold font-mono text-white">{apmStats.apdex.toFixed(2)}</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">Satisfaction score (T=300ms)</p>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-mono text-zinc-400 mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold font-mono text-white">{apmStats.avg_duration_ms.toFixed(1)} ms</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">Through transaction stream</p>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-mono text-zinc-400 mb-1">Throughput</p>
              <p className="text-2xl font-bold font-mono text-white">{apmStats.throughput_rpm.toFixed(1)} RPM</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">Requests per minute (10m window)</p>
            </div>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-mono text-zinc-400 mb-1">Transaction Error Rate</p>
              <p className="text-2xl font-bold font-mono text-white">{(apmStats.error_rate * 100).toFixed(1)}%</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">HTTP 500 status rates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slowest Endpoints Table */}
            <div className="lg:col-span-2 bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-white/10 bg-black">
                <h3 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-white" /> Slowest HTTP Transactions
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {apmStats.slowest.length === 0 ? (
                  <EmptyState 
                    icon={Zap}
                    title="No slow transactions"
                    description="All surveyed transactions executed within acceptable latency thresholds."
                  />
                ) : (
                  apmStats.slowest.map((tx: any) => (
                    <div key={tx.name} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition">
                      <span className="font-mono text-xs font-semibold text-white">{tx.name}</span>
                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-white">{tx.avg_duration_ms.toFixed(0)} ms</span>
                        <span className="text-[10px] text-zinc-500 block">across {tx.count} calls</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Web Vitals Card */}
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-white" /> Web Vitals (Mean)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-zinc-400">LCP (Largest Contentful)</span>
                    <span className="font-semibold text-white">{apmStats.web_vitals_avg.lcp.toFixed(2)}s</span>
                  </div>
                  <div className="h-1.5 bg-black border border-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((apmStats.web_vitals_avg.lcp / 4.0) * 100, 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-zinc-400">FID (First Input Delay)</span>
                    <span className="font-semibold text-white">{apmStats.web_vitals_avg.fid.toFixed(0)}ms</span>
                  </div>
                  <div className="h-1.5 bg-black border border-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-300 rounded-full" style={{ width: `${Math.min((apmStats.web_vitals_avg.fid / 150.0) * 100, 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-zinc-400">CLS (Cumulative Shift)</span>
                    <span className="font-semibold text-white">{apmStats.web_vitals_avg.cls.toFixed(3)}</span>
                  </div>
                  <div className="h-1.5 bg-black border border-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-400 rounded-full" style={{ width: `${Math.min((apmStats.web_vitals_avg.cls / 0.25) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
