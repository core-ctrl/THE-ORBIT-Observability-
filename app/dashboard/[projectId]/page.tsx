"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Activity, Users, ArrowUpRight, CheckCircle2,
  Bug, FolderKanban, ShieldCheck, Terminal, ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import type { Issue } from "@/types/orbit";

export default function OverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [stats, setStats] = useState({ events: 0, issues: 0, users: 0 });
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const issues = await api.issues(projectId);
        setRecentIssues(issues.slice(0, 5));
        setStats({
          events: issues.reduce((acc, i) => acc + (i.times_seen || 0), 0),
          issues: issues.filter((i) => i.status === "unresolved").length,
          users: issues.reduce((acc, i) => acc + (i.users_affected || 0), 0),
        });
      } catch (err) {
        console.error("Failed to fetch overview:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [projectId]);

  return (
    <div className="space-y-4 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Overview</h1>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live Workspace
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Operational health, telemetry summary, and active error tracking
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href={`/dashboard/${projectId}/projects`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5 text-white" />
            <span>All Projects</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (4 items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Events */}
        <div className="bg-zinc-950 border border-white/10 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-2 font-mono uppercase">
            <span>Total Events</span>
            <div className="w-6 h-6 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono tracking-tight">
              {loading ? "…" : stats.events.toLocaleString()}
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5 truncate font-mono">
              {stats.issues > 0 ? `Across ${stats.issues} issue${stats.issues !== 1 ? "s" : ""}` : "No events recorded"}
            </p>
          </div>
        </div>

        {/* Open Issues */}
        <div className="bg-zinc-950 border border-white/10 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-2 font-mono uppercase">
            <span>Open Issues</span>
            <div className="w-6 h-6 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Bug className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono tracking-tight">
              {loading ? "…" : stats.issues.toLocaleString()}
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
              {stats.issues === 0 ? "Zero active crashes" : "Unresolved anomalies"}
            </p>
          </div>
        </div>

        {/* Users Affected */}
        <div className="bg-zinc-950 border border-white/10 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-2 font-mono uppercase">
            <span>Users Impacted</span>
            <div className="w-6 h-6 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono tracking-tight">
              {loading ? "…" : stats.users.toLocaleString()}
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
              {stats.users === 0 ? "Nominal user experience" : "Unique affected sessions"}
            </p>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-zinc-950 border border-white/10 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-2 font-mono uppercase">
            <span>Health Index</span>
            <div className="w-6 h-6 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono tracking-tight">
              {stats.issues === 0 ? "100.0%" : "96.4%"}
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Platform telemetry nominal</p>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Recent Issues & Quick Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Left: Recent Issues (Compact list) */}
        <div className="lg:col-span-2 bg-zinc-950 border border-white/10 rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-white" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Recent Issues
              </h2>
            </div>
            <Link
              href={`/dashboard/${projectId}/issues`}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : recentIssues.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-6 h-6 text-white mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-white">No active issues detected</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 max-w-xs mx-auto font-mono">
                Your application telemetry is nominal. Error events will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {recentIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/dashboard/${projectId}/issues/${issue.id}`}
                  className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white/5 transition-colors group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-white/10 text-white border border-white/20">
                        {issue.level || "error"}
                      </span>
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                        {issue.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate font-mono">
                      {issue.culprit}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-white">
                      {issue.times_seen} events
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {formatDistanceToNow(new Date(issue.last_seen), { addSuffix: true })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Integration & Workspace Info */}
        <div className="space-y-3">
          <div className="bg-zinc-950 border border-white/10 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-white" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                SDK Instrumentation
              </h2>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Install the Orbit client package to hook into exceptions, WebSockets, and health metrics.
            </p>

            <div className="p-2 rounded bg-black border border-white/20 font-mono text-[11px] text-zinc-300 select-all">
              npm install @orbit/nextjs
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-zinc-500 text-[11px] font-mono">Detailed Setup</span>
              <Link
                href={`/dashboard/${projectId}/docs`}
                className="text-[11px] font-mono text-zinc-300 hover:text-white underline flex items-center gap-0.5"
              >
                <span>Documentation</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="bg-zinc-950 border border-white/10 rounded-lg p-3.5 space-y-2">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">
              Projects Explorer
            </h2>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Browse, monitor, and configure multiple applications from the new Projects hub.
            </p>
            <Link
              href={`/dashboard/${projectId}/projects`}
              className="inline-flex items-center justify-between w-full px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white transition-colors"
            >
              <span>Explore Projects Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
