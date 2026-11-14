"use client";

import { useOrbitStore } from "@/store/orbitStore";
import { useEndpoints } from "@/hooks/useEndpoints";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Activity, Globe, ArrowUpRight } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const isUp = status === "up";
  return (
    <span
      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
        isUp
          ? "bg-white text-black border-white font-semibold"
          : "bg-zinc-800 text-zinc-300 border-white/20"
      }`}
    >
      {status}
    </span>
  );
}

function LatencyBar({ ms }: { ms: number | null }) {
  if (ms === null) return <span className="text-zinc-600 font-mono text-xs">—</span>;
  return (
    <span className="text-xs font-mono font-semibold text-white">
      {ms.toFixed(0)}ms
    </span>
  );
}

function Skeleton() {
  return (
    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-32 bg-zinc-900 rounded" />
        <div className="h-4 w-16 bg-zinc-900 rounded" />
      </div>
      <div className="h-3 w-48 bg-zinc-900 rounded" />
      <div className="flex gap-4">
        <div className="h-3 w-20 bg-zinc-900 rounded" />
        <div className="h-3 w-20 bg-zinc-900 rounded" />
      </div>
    </div>
  );
}

export default function UptimePage() {
  const { isLoading, isError, refetch } = useEndpoints();
  const endpoints = useOrbitStore((s) => s.endpoints);
  const connected = useOrbitStore((s) => s.connected);

  const upCount = endpoints.filter((e) => e.status === "up").length;
  const downCount = endpoints.filter((e) => e.status === "down").length;

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Probes & Edge Availability
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <Globe className="h-4 w-4" />
              </span>
              Uptime Monitoring
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {endpoints.length === 0
                ? "NO ENDPOINTS"
                : `${upCount} UP · ${downCount} DOWN`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-white/10 text-xs font-mono">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-white animate-pulse" : "bg-zinc-600"}`} />
          <span className="text-zinc-300">{connected ? "Probes Live" : "Disconnected"}</span>
        </div>
      </div>

      {endpoints.length === 0 && connected ? (
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-10 text-center">
          <Globe className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
          <p className="text-white font-semibold text-sm">No uptime endpoints configured yet</p>
          <p className="text-zinc-400 text-xs mt-2 max-w-md mx-auto">
            Add target endpoints to <code className="bg-black border border-white/15 px-1.5 py-0.5 rounded text-white font-mono text-xs">orbit.config.yaml</code> to enable automated health probing.
          </p>
          <div className="mt-5 bg-black border border-white/10 rounded-xl p-4 text-left font-mono text-xs text-zinc-400 max-w-sm mx-auto">
            <div className="text-zinc-600 mb-1"># orbit.config.yaml</div>
            <div className="text-white">apps:</div>
            <div className="pl-4 text-zinc-300">{`- name: "Production API Gateway"`}</div>
            <div className="pl-6 text-zinc-400">url: https://api.production.internal</div>
            <div className="pl-6 text-zinc-500">health_endpoint: /health</div>
          </div>
        </div>
      ) : endpoints.length === 0 ? (
        <div className="space-y-3">
          <Skeleton /><Skeleton /><Skeleton />
        </div>
      ) : (
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <div key={ep.name} className="bg-zinc-950 border border-white/10 hover:border-white/20 transition rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <StatusBadge status={ep.status} />
                    <span className="font-semibold text-white text-sm">{ep.name}</span>
                  </div>
                  <a
                    href={ep.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-zinc-400 hover:text-white transition truncate flex items-center gap-1"
                  >
                    <span>{ep.url}</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                  </a>
                  {ep.error && (
                    <p className="text-xs text-zinc-400 mt-1 font-mono">{ep.error}</p>
                  )}
                </div>
                <div className="shrink-0 text-right space-y-1">
                  <LatencyBar ms={ep.latency_ms} />
                  {ep.status_code && (
                    <p className="text-[11px] font-mono text-zinc-500">HTTP {ep.status_code}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-[11px] font-mono text-zinc-500 border-t border-white/10 pt-3">
                <span>Method: <span className="text-zinc-300">{ep.method}</span></span>
                <span>Checked: <span className="text-zinc-300">
                  {ep.checked_at ? formatDistanceToNow(new Date(ep.checked_at), { addSuffix: true }) : "—"}
                </span></span>
                {ep.tags.length > 0 && (
                  <div className="flex gap-1.5 ml-auto">
                    {ep.tags.map((t) => (
                      <span key={t} className="bg-black border border-white/10 px-2 py-0.5 rounded text-[10px] text-zinc-400">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
