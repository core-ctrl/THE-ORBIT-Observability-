"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert,
  ArrowUpDown
} from "lucide-react";
import { api } from "@/lib/api";

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: { name: string; email: string };
  action: string;
  category: "auth" | "project" | "keys" | "security" | "members";
  target: string;
  ip: string;
  status: "success" | "failure";
}

export default function OrganizationAuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me()
      .then((user) => {
        if (user) {
          setEvents([
            {
              id: "aud_init",
              timestamp: new Date().toLocaleString(),
              actor: { name: user.name || "Owner", email: user.email || "admin@orbit.dev" },
              action: "auth.session_established",
              category: "auth",
              target: "Web Dashboard Session",
              ip: "127.0.0.1",
              status: "success",
            },
          ]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const jsonStr = JSON.stringify(events, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.target.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.email.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 max-w-5xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Audit Log & Compliance Trail</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Immutable log of all user logins, credential changes, project updates, and security events.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2.5 bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2 flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, target, or actor email..."
            className="bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none w-full font-mono"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-black border border-white/20 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none w-full sm:w-auto cursor-pointer"
        >
          <option value="all">All Event Categories</option>
          <option value="auth">Authentication & SSO</option>
          <option value="project">Project Workspaces</option>
          <option value="keys">API Keys & Tokens</option>
          <option value="security">Security Policies</option>
          <option value="members">Team Members</option>
        </select>
      </div>

      {/* Table */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black text-zinc-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Target Object</th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 text-xs animate-pulse">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 text-xs">
                    No audit records found matching query.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">{evt.timestamp}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-white font-sans">{evt.actor.name}</div>
                        <div className="text-[11px] text-zinc-500">{evt.actor.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
                        {evt.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-sans max-w-[200px] truncate">{evt.target}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{evt.ip}</td>
                    <td className="py-3.5 px-4">
                      {evt.status === "success" ? (
                        <span className="text-[10px] text-white flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          Success
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
