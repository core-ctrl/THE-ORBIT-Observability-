"use client";

import { useEffect, useState, useCallback, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, RefreshCw } from "lucide-react";
import type { AlertItem } from "@/types/orbit";

export default function AlertsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.alerts();
      setAlerts(data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === "all") return true;
    return alert.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    if (severity === "critical") {
      return "bg-white text-black border-white font-semibold";
    }
    if (severity === "warning") {
      return "bg-zinc-800 text-zinc-300 border-white/20 font-semibold";
    }
    return "bg-zinc-900 text-zinc-400 border-white/10 font-semibold";
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Incidents & Threshold Breaches
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <Bell className="h-4 w-4" />
              </span>
              System Alerts
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {filteredAlerts.length} ALERTS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-zinc-950 border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-white cursor-pointer"
          >
            <option value="all" className="bg-black text-white">All Severities</option>
            <option value="critical" className="bg-black text-white">Critical</option>
            <option value="warning" className="bg-black text-white">Warning</option>
            <option value="info" className="bg-black text-white">Info</option>
          </select>
          <button 
            onClick={fetchAlerts}
            className="bg-white text-black hover:bg-zinc-200 border border-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8"><ListSkeleton items={4} /></div>
        ) : filteredAlerts.length === 0 ? (
          <EmptyState 
            icon={Bell}
            title="Zero active alerts"
            description="All monitored systems and container instances are healthy and within defined SLOs."
          />
        ) : (
          <div className="divide-y divide-white/5">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className="flex items-start justify-between p-5 hover:bg-white/[0.02] transition">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="font-semibold text-white text-sm">{alert.title}</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">{alert.message}</p>
                  <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2 mt-1">
                    <span>Source: <strong className="text-zinc-300 font-semibold">{alert.source}</strong></span>
                    <span>&bull;</span>
                    <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
