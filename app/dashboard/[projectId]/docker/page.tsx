"use client";

import { useState } from "react";
import { useOrbitStore } from "@/store/orbitStore";
import { api } from "@/lib/api";
import {
  Container, RefreshCw, AlertCircle, Play, Square,
  RotateCw, Terminal, CheckCircle2, ShieldAlert, Radar,
  Activity, ArrowRight
} from "lucide-react";

function fmtBytes(b: number): string {
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(0)} MB`;
  return `${b} B`;
}

function StatusDot({ status }: { status: string }) {
  const isRunning = status === "running";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        isRunning ? "bg-white" : "bg-zinc-600"
      }`}
    />
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
      <div
        className="h-full rounded-full transition-all duration-300 bg-white"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

export default function DockerPage() {
  const docker = useOrbitStore((s) => s.docker);
  const containers = useOrbitStore((s) => s.containers);
  const connected = useOrbitStore((s) => s.connected);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const doAction = async (name: string, action: string) => {
    setActionLoading(`${name}-${action}`);
    setActionError(null);
    try {
      await api.containerAction(name, action as "start" | "stop" | "restart");
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Infrastructure Runtime &bull; Container Orchestration
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <Radar className="h-4 w-4" />
              </span>
              Docker Containers
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {containers.length} INSTANCES
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono bg-zinc-950 border border-white/15 shadow-sm">
            <div className="relative flex items-center justify-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-white" : "bg-zinc-600 animate-pulse"
                }`}
              />
              {connected && (
                <div className="absolute w-2 h-2 rounded-full bg-white animate-ping opacity-60" />
              )}
            </div>
            <span className={connected ? "text-white font-medium" : "text-zinc-500"}>
              {connected ? "DAEMON ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="bg-zinc-900 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white flex items-center justify-between font-mono">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs hover:text-zinc-400">✕</button>
        </div>
      )}

      {/* ── Disconnected Diagnostic Panel ── */}
      {!docker && !connected && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
          <div className="flex items-start gap-4 max-w-xl">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-semibold tracking-tight text-white">Telemetry Stream Syncing</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                  CONNECTING
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Awaiting telemetry ingestion from local container daemon.
                Real-time container events and performance metrics will populate automatically.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 font-mono">
                <span className="bg-black px-3 py-1.5 rounded-lg border border-white/10 text-white">
                  Daemon Socket: /var/run/docker.sock
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Auto-retrying in background
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Docker Unavailable State */}
      {docker && !docker.available && (
        <div className="rounded-2xl border border-white/15 bg-zinc-950 p-6">
          <div className="flex items-start gap-4 max-w-xl">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold tracking-tight text-white">Docker Daemon Inaccessible</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {docker.error || "Docker socket permission was denied or the service is not currently running."}
              </p>
              <p className="text-[11px] text-zinc-500 pt-1 font-mono">
                Launch Docker Desktop or start dockerd to stream live container telemetry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {!docker && connected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-zinc-950 border border-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {docker && docker.available && containers.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-12 text-center">
          <Container className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-semibold uppercase tracking-wider text-white">No active containers found</p>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Start a container with Docker or docker-compose to stream metrics here.
          </p>
        </div>
      )}

      {/* ── Container Cards Grid ── */}
      {containers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {containers.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-zinc-950 p-5 space-y-4 hover:border-white/20 transition group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot status={c.status} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white transition truncate">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">{c.image}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.restart_count > 0 && (
                    <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 border border-white/10 px-2 py-0.5 rounded font-semibold">
                      {c.restart_count} RESTARTS
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-semibold uppercase px-2.5 py-1 rounded ${
                      c.status === "running"
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>

              {/* Resource Metrics */}
              {c.status === "running" && (
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-zinc-500 uppercase text-[10px]">CPU</span>
                      <span className="text-white font-semibold">{c.cpu_percent.toFixed(1)}%</span>
                    </div>
                    <ProgressBar percent={c.cpu_percent} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-zinc-500 uppercase text-[10px]">Memory</span>
                      <span className="text-white font-semibold">
                        {fmtBytes(c.memory_usage)} ({c.memory_percent.toFixed(0)}%)
                      </span>
                    </div>
                    <ProgressBar percent={c.memory_percent} />
                  </div>
                </div>
              )}

              {/* Ports and Uptime */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500 pt-2 border-t border-white/10 font-mono">
                <div className="flex flex-wrap gap-1.5">
                  {c.ports.flatMap((p) =>
                    p.public_bindings.length > 0
                      ? p.public_bindings.map((b) => (
                          <span
                            key={b}
                            className="bg-black border border-white/10 px-2 py-0.5 rounded text-zinc-300"
                          >
                            {b} &rarr; {p.private_port}
                          </span>
                        ))
                      : []
                  )}
                </div>

                {c.uptime_seconds != null && (
                  <span>
                    Up {Math.floor(c.uptime_seconds / 3600)}h {Math.floor((c.uptime_seconds % 3600) / 60)}m
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                {c.status === "running" ? (
                  <>
                    <button
                      onClick={() => doAction(c.name, "restart")}
                      disabled={!!actionLoading}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white transition disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3 h-3" />
                      {actionLoading === `${c.name}-restart` ? "…" : "Restart"}
                    </button>
                    <button
                      onClick={() => doAction(c.name, "stop")}
                      disabled={!!actionLoading}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <Square className="w-3 h-3" />
                      {actionLoading === `${c.name}-stop` ? "…" : "Stop"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => doAction(c.name, "start")}
                    disabled={!!actionLoading}
                    className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" />
                    {actionLoading === `${c.name}-start` ? "…" : "Start"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
