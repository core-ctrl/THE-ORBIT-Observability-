"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Activity, 
  Layers, 
  TrendingUp, 
  HardDrive,
  Sparkles,
  FolderKanban
} from "lucide-react";
import { api } from "@/lib/api";
import type { Project } from "@/types/orbit";

export default function OrganizationStatsPage() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("30d");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects()
      .then((data) => {
        if (data) setProjects(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Stats & Telemetry Usage</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time breakdown of event ingestion volumes, trace retention, and infrastructure overhead.
          </p>
        </div>

        {/* Time Filter */}
        <div className="bg-black p-1 rounded-lg border border-white/20 flex items-center self-start sm:self-auto">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                timeRange === range ? "bg-white text-black shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              {range === "24h" ? "Last 24 Hours" : range === "7d" ? "7 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Monitored Projects</span>
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{loading ? "…" : projects.length}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            <span>{projects.length > 0 ? "Active in cluster" : "Awaiting first project"}</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Log & Trace Storage</span>
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">Nominal</div>
          <div className="text-[11px] text-zinc-500 font-mono mt-1">90-day cold storage enabled</div>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">AI Diagnoses (Guardian)</span>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">Active</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            <span>SLM Inference Online</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Cluster Telemetry</span>
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">100%</div>
          <div className="text-[11px] text-zinc-500 font-mono mt-1">Socket stream synced</div>
        </div>
      </div>

      {/* Monthly Quota Consumption */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white">Monthly Ingestion Quota</h2>
            <p className="text-xs text-zinc-400">Current cycle consumption against Enterprise tier limit.</p>
          </div>
          <span className="text-xs font-mono font-bold text-white">Live Stream Active</span>
        </div>

        <div className="w-full bg-black h-3 rounded-full overflow-hidden border border-white/10">
          <div
            className="bg-white h-full rounded-full transition-all duration-700"
            style={{ width: projects.length > 0 ? "25%" : "0%" }}
          />
        </div>

        <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
          <span>{projects.length} connected service{projects.length !== 1 ? "s" : ""}</span>
          <span>Unlimited Enterprise Quota</span>
        </div>
      </section>

      {/* Project Telemetry Breakdown */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/10 bg-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-white" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Consumption Breakdown by Project
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">{projects.length} project entity</span>
        </div>

        <div className="overflow-x-auto">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs font-mono">
              No projects deployed yet. Once projects ingest telemetry, usage records appear here.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 text-zinc-400 border-b border-white/10 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Service / Project</th>
                  <th className="py-3 px-4 font-semibold">Project Key</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Ingestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white font-mono">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold font-sans">{p.name}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{p.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      Telemetry Stream Online
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
