"use client";

import { useEffect, useState, useCallback, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { Flame, Plus, ShieldAlert, CheckCircle, MessageSquare, User, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { Incident, IncidentUpdate } from "@/types/orbit";

export default function IncidentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("minor");
  const [status, setStatus] = useState("open");
  const [updateMessage, setUpdateMessage] = useState("");

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await api.incidents(projectId);
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchIncidentDetails = async (id: string) => {
    try {
      const data = await api.incident(projectId, id);
      setSelectedIncident(data);
      setUpdates(data.updates || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [projectId]);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIncident(projectId, { title, severity });
      setIsModalOpen(false);
      setTitle("");
      setSeverity("minor");
      setStatus("open");
      fetchIncidents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !updateMessage) return;
    try {
      await api.addIncidentUpdate(projectId, selectedIncident.id, {
        message: updateMessage,
        status: selectedIncident.status,
      });
      setUpdateMessage("");
      fetchIncidentDetails(selectedIncident.id);
      fetchIncidents();
    } catch (e) {
      console.error(e);
    }
  };

  const updateIncidentState = async (updatesObj: Partial<Incident>) => {
    if (!selectedIncident) return;
    try {
      await api.updateIncident(projectId, selectedIncident.id, updatesObj);
      fetchIncidentDetails(selectedIncident.id);
      fetchIncidents();
    } catch (e) {
      console.error(e);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-white text-black border-white font-semibold";
      case "major":
        return "bg-zinc-800 text-zinc-300 border-white/20 font-semibold";
      default:
        return "bg-zinc-900 text-zinc-400 border-white/10 font-semibold";
    }
  };

  const getStatusBadge = (stat: string) => {
    switch (stat) {
      case "resolved":
        return "bg-white text-black border-white font-semibold";
      default:
        return "bg-zinc-900 text-zinc-300 border-white/15 font-semibold";
    }
  };

  if (loading) {
    return <ListSkeleton items={4} />;
  }

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Outage Timeline & Mitigation Tracking
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <Flame className="h-4 w-4" />
              </span>
              Incidents
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {incidents.length} INCIDENTS
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Trigger Incident
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
            {incidents.length === 0 ? (
              <EmptyState 
                icon={CheckCircle}
                title="All systems operational"
                description="Zero active outages or degraded services reported across workspace clusters."
              />
            ) : (
              <div className="divide-y divide-white/5">
                {incidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => fetchIncidentDetails(inc.id)}
                    className={`w-full text-left p-5 flex items-start gap-4 hover:bg-white/[0.02] transition ${
                      selectedIncident?.id === inc.id ? "bg-white/[0.04]" : ""
                    }`}
                  >
                    <Flame className={`w-5 h-5 shrink-0 mt-0.5 ${inc.status === "resolved" ? "text-zinc-600" : "text-white"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-white truncate text-sm">{inc.title}</span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getSeverityBadge(inc.severity)}`}>
                          {inc.severity}
                        </span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getStatusBadge(inc.status)}`}>
                          {inc.status}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-zinc-500">
                        Triggered {formatDistanceToNow(new Date(inc.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Incident Details */}
        <div className="space-y-4">
          {selectedIncident ? (
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-5">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-semibold text-white mb-2">{selectedIncident.title}</h2>
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${getSeverityBadge(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${getStatusBadge(selectedIncident.status)}`}>
                    {selectedIncident.status}
                  </span>
                </div>
                
                {/* Quick actions */}
                <div className="flex gap-2">
                  <select
                    value={selectedIncident.status}
                    onChange={(e) => updateIncidentState({ status: e.target.value as Incident['status'] })}
                    className="bg-black border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none text-white focus:border-white cursor-pointer"
                  >
                    <option value="open" className="bg-black text-white">Open</option>
                    <option value="investigating" className="bg-black text-white">Investigating</option>
                    <option value="identified" className="bg-black text-white">Identified</option>
                    <option value="monitoring" className="bg-black text-white">Monitoring</option>
                    <option value="resolved" className="bg-black text-white">Resolved</option>
                  </select>
                  
                  <select
                    value={selectedIncident.severity}
                    onChange={(e) => updateIncidentState({ severity: e.target.value as Incident['severity'] })}
                    className="bg-black border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none text-white focus:border-white cursor-pointer"
                  >
                    <option value="minor" className="bg-black text-white">Minor</option>
                    <option value="major" className="bg-black text-white">Major</option>
                    <option value="critical" className="bg-black text-white">Critical</option>
                  </select>
                </div>
              </div>

              {/* Updates log */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-white" /> Timeline Updates
                </h3>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {updates.length === 0 ? (
                    <p className="text-xs font-mono text-zinc-500">No updates logged yet.</p>
                  ) : (
                    updates.map((up) => (
                      <div key={up.id} className="text-xs border border-white/10 bg-black rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between text-zinc-500 font-mono text-[11px]">
                          <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                            <User className="w-3 h-3 text-white" /> Operator Update
                          </span>
                          <span>{formatDistanceToNow(new Date(up.created_at), { addSuffix: true })}</span>
                        </div>
                        <p className="text-white leading-relaxed font-sans">{up.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddUpdate} className="pt-2 border-t border-white/10 space-y-2">
                  <textarea
                    placeholder="Write a timeline update..."
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    rows={2}
                    className="w-full bg-black border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold py-2 rounded-xl transition"
                  >
                    Post Incident Update
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 text-center text-zinc-400 flex flex-col items-center py-12">
              <ShieldAlert className="w-6 h-6 text-zinc-500 mb-2" />
              <p className="text-xs font-mono">Select an incident to view root-cause investigations, status changes, and public timeline logs.</p>
            </div>
          )}
        </div>
      </div>

      {/* Trigger Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/20 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="text-white w-4 h-4" /> Trigger New Incident
            </h2>
            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Incident Title</label>
                <input
                  type="text"
                  placeholder="e.g. Major checkout queue failure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg p-2.5 text-xs font-mono text-white outline-none focus:border-white cursor-pointer"
                  >
                    <option value="minor" className="bg-black text-white">Minor</option>
                    <option value="major" className="bg-black text-white">Major</option>
                    <option value="critical" className="bg-black text-white">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg p-2.5 text-xs font-mono text-white outline-none focus:border-white cursor-pointer"
                  >
                    <option value="open" className="bg-black text-white">Open</option>
                    <option value="investigating" className="bg-black text-white">Investigating</option>
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
                  Trigger Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
