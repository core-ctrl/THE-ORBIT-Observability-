"use client";

import { useEffect, useState, useCallback, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus, RefreshCw, Layers } from "lucide-react";
import { api, ingest } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { CustomMetric } from "@/types/orbit";

export default function MetricsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [metrics, setMetrics] = useState<CustomMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [value, setValue] = useState<number | "">("");
  const [type, setType] = useState("counter");

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await api.metrics(projectId);
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMetrics();
  }, [projectId]);

  const handleIngestMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value === "") return;
    try {
      const project = await api.project(projectId);
      const dsnKey = project.dsn_key || project.dsnKey;
      if (!dsnKey) return;
      await ingest.metrics(dsnKey, { name, value: Number(value), type });
      setIsModalOpen(false);
      setName("");
      setValue("");
      setType("counter");
      fetchMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  // Group metrics by name
  const groupedMetrics = metrics.reduce((acc: any, m: any) => {
    if (!acc[m.name]) {
      acc[m.name] = [];
    }
    acc[m.name].push(m);
    return acc;
  }, {});

  const renderSparkline = (metricList: any[]) => {
    const sorted = [...metricList].reverse();
    if (sorted.length < 2) return <div className="h-16 flex items-center justify-center text-zinc-500 font-mono text-xs">Waiting for additional sample points...</div>;
    
    const values = sorted.map(s => s.value);
    const min = Math.min(...values);
    const max = Math.max(...values, min + 1);
    
    const pts = sorted.map((item, i) => {
      const x = (i / (sorted.length - 1)) * 100;
      const y = 90 - ((item.value - min) / (max - min)) * 80;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline fill="none" stroke="#ffffff" strokeWidth="2.5" points={pts} />
      </svg>
    );
  };

  if (loading) {
    return <div className="space-y-6"><ListSkeleton items={3} /></div>;
  }

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Telemetry Counters & Gauges
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <BarChart3 className="h-4 w-4" />
              </span>
              Custom Metrics
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {Object.keys(groupedMetrics).length} METRICS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            className="bg-zinc-950 border border-white/15 hover:border-white/30 text-white p-2.5 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Ingest Metric
          </button>
        </div>
      </div>

      {Object.keys(groupedMetrics).length === 0 ? (
        <EmptyState 
          icon={BarChart3}
          title="No custom metrics recorded"
          description="Send custom instrumentation counters or gauges via the telemetry API to automatically populate dashboards."
        >
          <div className="bg-black border border-white/10 rounded-xl overflow-hidden mt-4 text-left max-w-xl mx-auto">
            <div className="bg-zinc-950 px-4 py-2 text-xs font-mono font-semibold text-zinc-400 border-b border-white/10 flex items-center justify-between">
              <span>cURL Integration</span>
              <span className="text-zinc-500">POST /api/v1/metrics</span>
            </div>
            <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
              <code>curl -X POST http://localhost:8000/api/v1/metrics/YOUR_DSN_KEY \</code>
              <code className="block pl-4">-H &quot;Content-Type: application/json&quot; \</code>
              <code className="block pl-4">-d &apos;{JSON.stringify({ name: "checkout_throughput", value: 120, type: "counter" })}&apos;</code>
            </pre>
          </div>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(groupedMetrics).map(([metricName, items]: [string, any]) => {
            const latest = items[0];
            const avg = items.reduce((sum: number, item: any) => sum + item.value, 0) / items.length;
            const peak = Math.max(...items.map((i: any) => i.value));
            
            return (
              <div key={metricName} className="bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-4 hover:border-white/20 transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{metricName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-black text-zinc-300 border border-white/10 text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold">{latest.type}</span>
                      <span className="text-xs font-mono text-zinc-500">Updated {formatDistanceToNow(new Date(latest.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-2xl font-bold text-white">{latest.value.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Latest</p>
                  </div>
                </div>

                {/* Graph */}
                <div className="bg-black border border-white/10 rounded-xl p-3">
                  {renderSparkline(items)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-white/10 pt-3 text-zinc-400">
                  <div>
                    <span className="text-zinc-600">Mean:</span> <span className="font-semibold text-white">{avg.toFixed(1)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-600">Peak:</span> <span className="font-semibold text-white">{peak.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Ingest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/20 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="text-white w-4 h-4" /> Ingest Metric Point
            </h2>
            <form onSubmit={handleIngestMetric} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Metric Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. queue_backlog_size"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Value</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 150"
                    value={value}
                    onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Metric Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-white cursor-pointer"
                  >
                    <option value="counter" className="bg-black text-white">Counter</option>
                    <option value="gauge" className="bg-black text-white">Gauge</option>
                    <option value="histogram" className="bg-black text-white">Histogram</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-xl text-xs font-semibold"
                >
                  Submit Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
