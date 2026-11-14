"use client";

import { useEffect, useState, useCallback, useMemo, use, useRef } from "react";
import { useOrbitStore } from "@/store/orbitStore";
import { formatDistanceToNow } from "date-fns";
import { FileText, RefreshCw, Terminal, Plus, Search, Radio, Send, Pause, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api, ingest } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { AppLog } from "@/types/orbit";

export default function LogsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const liveLogs = useOrbitStore((s) => s.logs);
  const connected = useOrbitStore((s) => s.connected);

  const [activeTab, setActiveTab] = useState<"live" | "sdk">("live");
  const [sdkLogs, setSdkLogs] = useState<AppLog[]>([]);
  const [loadingSdk, setLoadingSdk] = useState(false);
  const [sendingPing, setSendingPing] = useState(false);
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [clearedBeforeTimestamp, setClearedBeforeTimestamp] = useState<number>(0);

  // Filters
  const [levelFilter, setLevelFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Performance-optimized buffer window: limit to 150 latest logs to prevent DOM bloat
  const reversedLiveLogs = useMemo(() => {
    if (isStreamPaused) return [];
    const filtered = clearedBeforeTimestamp
      ? liveLogs.filter((l) => new Date(l.timestamp).getTime() > clearedBeforeTimestamp)
      : liveLogs;
    return filtered.slice(0, 150);
  }, [liveLogs, isStreamPaused, clearedBeforeTimestamp]);

  const fetchSdkLogs = useCallback(async () => {
    setLoadingSdk(true);
    try {
      const data = await api.logs(projectId, {
        level: levelFilter || undefined,
        source: sourceFilter || undefined,
        search: searchQuery || undefined,
        limit: 100,
      });
      setSdkLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSdk(false);
    }
  }, [projectId, levelFilter, sourceFilter, searchQuery]);

  useEffect(() => {
    if (activeTab === "sdk") {
      fetchSdkLogs();
    }
  }, [activeTab, levelFilter, sourceFilter, projectId]);

  // Send real test telemetry event
  const handleSendTelemetryPing = async () => {
    setSendingPing(true);
    try {
      const project = await api.project(projectId);
      const dsn_key = project.dsn_key || project.dsnKey;
      if (!dsn_key) return;
      
      const levels = ["info", "warn", "error"];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      
      await ingest.logs(dsn_key, {
        level: randomLevel,
        source: "telemetry-probe",
        message: `Diagnostic telemetry probe emitted from dashboard explorer. Latency: ${(Math.random() * 20).toFixed(2)}ms.`
      });

      if (activeTab === "sdk") {
        fetchSdkLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingPing(false);
    }
  };

  function levelColor(msg: string) {
    const m = msg.toLowerCase();
    if (m.includes("error") || m.includes("critical") || m === "error" || m === "critical")
      return "text-white font-bold underline decoration-zinc-500";
    if (m.includes("warn") || m === "warn" || m === "warning") return "text-zinc-200 font-medium";
    if (m.includes("info") || m === "info") return "text-zinc-300";
    return "text-zinc-400";
  }

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Telemetry Stream & Log Explorer
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <Terminal className="h-4 w-4" />
              </span>
              Log Stream
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {activeTab === "live" ? `${reversedLiveLogs.length} EVENTS (BUFFERED)` : `${sdkLogs.length} LOGS`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === "live" && (
            <>
              <button
                onClick={() => setIsStreamPaused((prev) => !prev)}
                className="bg-zinc-950 border border-white/15 hover:border-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition"
              >
                {isStreamPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isStreamPaused ? "Resume Stream" : "Pause Stream"}</span>
              </button>
              <button
                onClick={() => setClearedBeforeTimestamp(Date.now())}
                className="bg-zinc-950 border border-white/15 hover:border-white/30 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono transition"
                title="Clear current stream buffer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {activeTab === "sdk" && (
            <button
              onClick={handleSendTelemetryPing}
              disabled={sendingPing}
              className="bg-white text-black hover:bg-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingPing ? "Emitting..." : "Send Telemetry Event"}</span>
            </button>
          )}

          <div className="flex bg-zinc-950 border border-white/15 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("live")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === "live" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Live Daemon Stream
            </button>
            <button
              onClick={() => setActiveTab("sdk")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === "sdk" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              SDK Application Logs
            </button>
          </div>
        </div>
      </div>

      {activeTab === "live" ? (
        // Live Docker Logs stream
        <div className="bg-black border border-white/10 rounded-2xl overflow-hidden font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-zinc-950">
            <span className="text-zinc-400 flex items-center gap-2 text-xs">
              <Terminal className="w-3.5 h-3.5 text-white" /> High-Throughput Stream Terminal
            </span>
            <div className="flex items-center gap-3">
              {isStreamPaused && (
                <span className="text-[10px] bg-zinc-900 border border-white/20 text-white px-2 py-0.5 rounded font-mono uppercase">
                  STREAM PAUSED
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-white animate-pulse" : "bg-zinc-600"}`} />
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{connected ? "Streaming" : "Disconnected"}</span>
              </div>
            </div>
          </div>

          <div className="h-[560px] overflow-y-auto p-4 space-y-1 bg-black">
            {!connected && reversedLiveLogs.length === 0 ? (
              <p className="text-zinc-400 text-center py-16 font-mono">
                Awaiting telemetry connection &bull; Start containers or SDK client to stream events.
              </p>
            ) : reversedLiveLogs.length === 0 ? (
              <p className="text-zinc-500 text-center py-16 font-mono">
                {isStreamPaused ? "Stream paused. Click Resume Stream to display new packets." : "Listening for container events… Logs will appear here in real-time."}
              </p>
            ) : (
              reversedLiveLogs.map((log, i) => (
                <div key={`${log.timestamp}-${i}`} className="flex gap-3 py-1 hover:bg-white/[0.04] px-2 rounded">
                  <span className="text-zinc-500 shrink-0 w-20 truncate">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-zinc-300 font-semibold shrink-0 w-24 truncate">[{log.source}]</span>
                  <span className={levelColor(log.message)}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Persistent SDK Logs
        <div className="space-y-4">
          {/* Query Filters */}
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <span className="absolute left-3 top-2.5 text-zinc-500"><Search className="w-4 h-4" /></span>
              <input
                type="text"
                placeholder="Search log messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchSdkLogs()}
                className="w-full bg-black border border-white/15 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-white"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-white cursor-pointer"
              >
                <option value="" className="bg-black text-white">All Levels</option>
                <option value="info" className="bg-black text-white">Info</option>
                <option value="warn" className="bg-black text-white">Warning</option>
                <option value="error" className="bg-black text-white">Error</option>
                <option value="debug" className="bg-black text-white">Debug</option>
              </select>

              <input
                type="text"
                placeholder="Source (e.g. nextjs)"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-500 outline-none focus:border-white w-36"
              />
              
              <button
                onClick={fetchSdkLogs}
                className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Query
              </button>
            </div>
          </div>

          <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden font-mono text-xs shadow-sm">
            {loadingSdk ? (
              <div className="p-8"><ListSkeleton items={5} /></div>
            ) : sdkLogs.length === 0 ? (
              <div className="p-8">
                <EmptyState 
                  icon={FileText}
                  title="No logs found"
                  description="No application logs matching this filter. Send telemetry pings above or initialize the Orbit SDK."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black text-zinc-400 text-[10px] uppercase tracking-wider text-left">
                      <th className="p-3 w-32">Timestamp</th>
                      <th className="p-3 w-24">Level</th>
                      <th className="p-3 w-32">Source</th>
                      <th className="p-3">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sdkLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-3 text-zinc-500 truncate">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3">
                          <span className={`font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded border border-white/10 ${levelColor(log.level)}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-300 font-semibold truncate">
                          {log.source}
                        </td>
                        <td className="p-3 text-white break-all">
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
