"use client";

import { useOrbitStore } from "@/store/orbitStore";
import { formatDistanceToNow } from "date-fns";
import { Database, Server, Zap, HardDrive, RefreshCw } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const isUp = status === "up";
  return (
    <span
      className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded border ${
        isUp
          ? "bg-white text-black border-white font-semibold"
          : "bg-zinc-800 text-zinc-300 border-white/10"
      }`}
    >
      {status}
    </span>
  );
}

function DbIcon({ type }: { type: string }) {
  if (type === "redis") return <Zap className="w-5 h-5 text-white" />;
  if (type === "mongodb") return <HardDrive className="w-5 h-5 text-white" />;
  return <Database className="w-5 h-5 text-white" />;
}

function Skeleton() {
  return <div className="h-32 bg-zinc-950 border border-white/10 rounded-2xl animate-pulse" />;
}

export default function DatabasesPage() {
  const databases = useOrbitStore((s) => s.databases);
  const connected = useOrbitStore((s) => s.connected);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Storage & Telemetry
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <Database className="h-4 w-4" />
              </span>
              Databases
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {databases.length} MONITORED
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-white/10 text-xs font-mono">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-white animate-pulse" : "bg-zinc-600"}`} />
          <span className="text-zinc-300">{connected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {databases.length === 0 && connected ? (
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-10 text-center">
          <Database className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
          <p className="text-white font-semibold text-sm">No databases configured</p>
          <p className="text-zinc-400 text-xs mt-2 max-w-md mx-auto">
            Add database connections to <code className="bg-black border border-white/15 px-1.5 py-0.5 rounded text-white font-mono text-xs">orbit.config.yaml</code> to monitor query latency and pool health.
          </p>
          <div className="mt-5 bg-black border border-white/10 rounded-xl p-4 text-left font-mono text-xs text-zinc-400 max-w-sm mx-auto">
            <div className="text-zinc-600 mb-1"># orbit.config.yaml</div>
            <div className="text-white">databases:</div>
            <div className="pl-4 text-zinc-300">- name: &quot;Production Postgres&quot;</div>
            <div className="pl-6 text-zinc-400">type: postgres</div>
            <div className="pl-6 text-zinc-500">uri: postgresql://user:pass@host/db</div>
          </div>
        </div>
      ) : databases.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton /><Skeleton /><Skeleton /><Skeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {databases.map((db) => (
            <div
              key={db.name}
              className="bg-zinc-950 border border-white/10 hover:border-white/20 transition rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <DbIcon type={db.type} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{db.name}</p>
                    <p className="text-[11px] text-zinc-500 capitalize font-mono">{db.type}</p>
                  </div>
                </div>
                <StatusBadge status={db.status} />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Query Latency</span>
                  <span className="font-mono text-white font-semibold">
                    {db.latency_ms !== null ? `${db.latency_ms.toFixed(1)}ms` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Last Synced</span>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {db.checked_at ? formatDistanceToNow(new Date(db.checked_at), { addSuffix: true }) : "—"}
                  </span>
                </div>
                {db.error && (
                  <p className="text-xs text-zinc-400 mt-2 border-t border-white/10 pt-2 font-mono">{db.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
