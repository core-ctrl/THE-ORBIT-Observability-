"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bug, Search, AlertCircle, Copy, Check, Terminal, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { api } from "@/lib/api";
import type { Issue } from "@/types/orbit";

export default function IssuesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("unresolved");
  const [search, setSearch] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [sdkTab, setSdkTab] = useState<"nextjs" | "python" | "node">("nextjs");
  const [copied, setCopied] = useState(false);

  const fetchIssues = useCallback(async () => {
    try {
      const data = await api.issues(projectId, {
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search || undefined,
      });
      setIssues(data);
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, statusFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchIssues();
  }, [fetchIssues]);

  useEffect(() => {
    const timer = setTimeout(() => fetchIssues(), 300);
    return () => clearTimeout(timer);
  }, [search, fetchIssues]);

  const toggleSelectAll = () => {
    if (selectedIssues.size === issues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(issues.map(i => i.id)));
    }
  };

  const toggleIssueSelect = (id: string) => {
    const newSet = new Set(selectedIssues);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIssues(newSet);
  };

  const handleBulkAction = async (status: string) => {
    if (selectedIssues.size === 0) return;
    setBulkActionLoading(true);
    try {
      await api.bulkUpdateIssues(projectId, Array.from(selectedIssues), status);
      await fetchIssues();
      setSelectedIssues(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Diagnostics & Exceptions
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <Bug className="h-4 w-4" />
              </span>
              Issues
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {issues.length} TRACKED
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-white cursor-pointer"
          >
            <option value="all" className="bg-black text-white">All Issues</option>
            <option value="unresolved" className="bg-black text-white">Unresolved</option>
            <option value="resolved" className="bg-black text-white">Resolved</option>
            <option value="ignored" className="bg-black text-white">Ignored</option>
          </select>
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search stack traces, culprits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-950 border border-white/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-white w-64 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIssues.size > 0 && (
        <div className="bg-zinc-900 border border-white/20 rounded-xl p-3 flex items-center justify-between shadow-lg animate-fade-in">
          <span className="text-xs font-mono font-semibold text-white px-2">
            {selectedIssues.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("resolved")}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-semibold transition"
            >
              Resolve Selected
            </button>
            <button
              onClick={() => handleBulkAction("ignored")}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 rounded-lg text-xs font-semibold transition"
            >
              Ignore Selected
            </button>
            <button
              onClick={() => handleBulkAction("unresolved")}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 rounded-lg text-xs font-semibold transition"
            >
              Mark Unresolved
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <ListSkeleton items={5} />
      ) : issues.length === 0 ? (
        <EmptyState
          icon={Bug}
          title={search ? "No matching issues" : "Zero active exceptions detected"}
          description={search ? "Try adjusting your search query or status filter." : "No uncaught exceptions reported yet. Install the Orbit SDK in your application to start streaming real-time stack traces and Sentinel diagnostics."}
          action={search ? { label: "Clear search", onClick: () => { setSearch(""); setStatusFilter("all"); } } : {
            label: "Explore SDK Documentation",
            onClick: () => { window.location.href = `/dashboard/${projectId}/docs`; }
          }}
        >
          {!search && (
            <div className="bg-black border border-white/15 rounded-2xl overflow-hidden mt-6 text-left max-w-2xl mx-auto shadow-2xl">
              {/* Window Header */}
              <div className="bg-zinc-950 px-4 py-2.5 text-xs font-mono font-medium text-zinc-400 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
                  <span className="ml-2 text-zinc-300">Quickstart Setup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(["nextjs", "python", "node"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSdkTab(tab)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded transition ${
                        sdkTab === tab ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {tab === "nextjs" ? "Next.js" : tab === "python" ? "Python" : "Node.js"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Install Command & Copy */}
              <div className="bg-black px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">
                  <span className="text-white mr-2">$</span>
                  <span className="text-zinc-200">
                    {sdkTab === "nextjs" ? "npm install @orbit-sdk/nextjs" :
                     sdkTab === "python" ? "pip install orbit-observability" :
                     "npm install @orbitapp/node"}
                  </span>
                </span>
                <button
                  onClick={() => {
                    const cmd = sdkTab === "nextjs" ? "npm install @orbit-sdk/nextjs" :
                                sdkTab === "python" ? "pip install orbit-observability" :
                                "npm install @orbitapp/node";
                    navigator.clipboard.writeText(cmd);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Code Snippet */}
              <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed bg-black">
                {sdkTab === "nextjs" && (
                  <>
                    <code className="block text-zinc-400">import <span className="text-white">{'{'}</span> initOrbit <span className="text-white">{'}'}</span> from <span className="text-zinc-300">&quot;@orbit-sdk/nextjs&quot;</span>;</code>
                    <code className="block mt-2"><span className="text-white font-semibold">initOrbit</span>({'{'}</code>
                    <code className="block pl-4 text-zinc-400">dsn: <span className="text-zinc-300">&quot;http://localhost:8010/{projectId}&quot;</span>,</code>
                    <code className="block pl-4 text-zinc-400">environment: <span className="text-zinc-300">&quot;production&quot;</span>,</code>
                    <code className="block pl-4 text-zinc-400">tracesSampleRate: <span className="text-white">1.0</span></code>
                    <code className="block text-white">{'}'});</code>
                  </>
                )}
                {sdkTab === "python" && (
                  <>
                    <code className="block text-zinc-400">import <span className="text-white">orbit_observability</span> as orbit</code>
                    <code className="block mt-2">orbit.<span className="text-white font-semibold">init</span>(</code>
                    <code className="block pl-4 text-zinc-400">dsn=<span className="text-zinc-300">&quot;http://localhost:8010/{projectId}&quot;</span>,</code>
                    <code className="block pl-4 text-zinc-400">environment=<span className="text-zinc-300">&quot;production&quot;</span>,</code>
                    <code className="block pl-4 text-zinc-400">auto_instrument_fastapi=<span className="text-white">True</span></code>
                    <code className="block text-white">)</code>
                  </>
                )}
                {sdkTab === "node" && (
                  <>
                    <code className="block text-zinc-400">const <span className="text-white">Orbit</span> = <span className="text-white font-semibold">require</span>(<span className="text-zinc-300">&quot;@orbitapp/node&quot;</span>);</code>
                    <code className="block mt-2">Orbit.<span className="text-white font-semibold">init</span>({'{'}</code>
                    <code className="block pl-4 text-zinc-400">dsn: <span className="text-zinc-300">&quot;http://localhost:8010/{projectId}&quot;</span>,</code>
                    <code className="block pl-4 text-zinc-400">environment: <span className="text-zinc-300">&quot;production&quot;</span></code>
                    <code className="block text-white">{'}'});</code>
                  </>
                )}
              </pre>
            </div>
          )}
        </EmptyState>
      ) : (
        <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
          <div className="bg-zinc-900/60 px-4 py-3 border-b border-white/10 flex items-center gap-4">
            <input 
              type="checkbox" 
              checked={selectedIssues.size === issues.length && issues.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-white/20 bg-black text-white focus:ring-0 cursor-pointer" 
            />
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">Select All</span>
          </div>
          <div className="divide-y divide-white/5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`flex items-center p-4 hover:bg-white/[0.03] transition group ${selectedIssues.has(issue.id) ? 'bg-white/[0.06]' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedIssues.has(issue.id)}
                  onChange={() => toggleIssueSelect(issue.id)}
                  className="w-4 h-4 rounded border-white/20 bg-black text-white focus:ring-0 cursor-pointer mr-4 shrink-0"
                />
                
                {/* Level indicator */}
                <div className="w-1 h-10 rounded-full mr-4 shrink-0 bg-white" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                      {issue.type}
                    </span>
                    <Link
                      href={`/dashboard/${projectId}/issues/${issue.id}`}
                      className="font-semibold text-white truncate hover:underline transition"
                    >
                      {issue.title}
                    </Link>
                  </div>
                  <div className="text-xs font-mono text-zinc-400 truncate">
                    {issue.culprit}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1.5 flex items-center gap-3 font-mono">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-zinc-400" />
                      {issue.times_seen} events
                    </span>
                    <span>&bull;</span>
                    <span>{issue.users_affected} users</span>
                    <span>&bull;</span>
                    <span>{formatDistanceToNow(new Date(issue.last_seen), { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded border border-white/20 bg-zinc-900 text-zinc-300 font-semibold uppercase">
                    {issue.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
