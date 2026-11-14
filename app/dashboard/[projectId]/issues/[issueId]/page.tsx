"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Terminal, FileText, Check, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { PageSkeleton } from "@/components/ui/loading-skeleton";
import type { Issue, ErrorEvent, StackFrame } from "@/types/orbit";

export default function IssueDetailPage({ params }: { params: Promise<{ projectId: string, issueId: string }> }) {
  const { projectId, issueId } = use(params);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [events, setEvents] = useState<ErrorEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"stack" | "breadcrumbs" | "context" | "events" | "ai">("stack");
  
  // AI Insights states
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightProvider, setInsightProvider] = useState("");
  
  // Auto-Heal states
  const [showHealModal, setShowHealModal] = useState(false);
  const [healing, setHealing] = useState(false);
  const [healResult, setHealResult] = useState<{ patch: string; pr_url: string; message: string } | null>(null);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const [issueData, eventsData] = await Promise.all([
          api.issue(projectId, issueId),
          api.issueEvents(projectId, issueId),
        ]);
        setIssue(issueData);
        setEvents(eventsData);
      } catch (e) {
        console.error(e);
      }
    };
    fetchIssue();
  }, [projectId, issueId]);

  const fetchAiInsights = async () => {
    if (insight) return;
    setLoadingInsight(true);
    try {
      const data = await api.issueAiInsights(projectId, issueId);
      setInsight((data as Record<string, string>).insight || (data as Record<string, string>).analysis);
      setInsightProvider((data as Record<string, string>).provider || "Sentinel AI");
    } catch (e) {
      console.error(e);
      setInsight("Unable to fetch AI insights. Verify backend connectivity.");
    } finally {
      setLoadingInsight(false);
    }
  };

  useEffect(() => {
    if (activeTab === "ai") {
      fetchAiInsights();
    }
  }, [activeTab]);

  const handleSelfHeal = async () => {
    setHealing(true);
    try {
      const res = await api.healIssue(projectId, issueId);
      if (res.status === "success") {
        setHealResult({
          patch: res.patch,
          pr_url: res.pr.pr_url,
          message: res.pr.message
        });
      }
    } catch (e) {
      console.error(e);
      alert("Self-heal operation failed. Check repository integration.");
    } finally {
      setHealing(false);
    }
  };

  if (!issue) return <PageSkeleton />;

  return (
    <div className="space-y-6 max-w-5xl text-white">
      <Link
        href={`/dashboard/${projectId}/issues`}
        className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to issues
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold uppercase">
            {issue.type}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/20 bg-zinc-900 text-zinc-300 uppercase font-semibold">
            {issue.status}
          </span>
        </div>
        <h1 className="text-xl font-bold text-white break-words">{issue.title}</h1>
        <div className="text-xs font-mono text-zinc-400 mt-1">{issue.culprit}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl">
          <div className="text-[11px] font-mono text-zinc-500 mb-1">First seen</div>
          <div className="text-sm font-semibold">{formatDistanceToNow(new Date(issue.first_seen), { addSuffix: true })}</div>
        </div>
        <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl">
          <div className="text-[11px] font-mono text-zinc-500 mb-1">Last seen</div>
          <div className="text-sm font-semibold">{formatDistanceToNow(new Date(issue.last_seen), { addSuffix: true })}</div>
        </div>
        <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl">
          <div className="text-[11px] font-mono text-zinc-500 mb-1">Times seen</div>
          <div className="text-sm font-semibold font-mono">{issue.times_seen}</div>
        </div>
        <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl">
          <div className="text-[11px] font-mono text-zinc-500 mb-1">Users affected</div>
          <div className="text-sm font-semibold font-mono">{issue.users_affected}</div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
        {/* Tab selection headers */}
        <div className="flex items-center border-b border-white/10 bg-black px-2 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("stack")}
            className={`px-4 py-3 text-xs font-mono font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "stack" ? "border-white text-white font-semibold" : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Stack Trace
          </button>
          <button
            onClick={() => setActiveTab("breadcrumbs")}
            className={`px-4 py-3 text-xs font-mono font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "breadcrumbs" ? "border-white text-white font-semibold" : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Breadcrumbs
          </button>
          <button
            onClick={() => setActiveTab("context")}
            className={`px-4 py-3 text-xs font-mono font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "context" ? "border-white text-white font-semibold" : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Context
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-3 text-xs font-mono font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "events" ? "border-white text-white font-semibold" : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-3 text-xs font-mono font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "ai" ? "border-white text-white font-semibold" : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" /> Sentinel Root Cause
          </button>
        </div>
        
        <div className="p-0">
          {activeTab === "stack" && (
            events[0]?.stack_trace ? (
              <div className="divide-y divide-white/5">
                {events[0].stack_trace.map((frame: StackFrame, idx: number) => (
                  <div key={idx} className="p-4 font-mono text-[12px] hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-zinc-300 font-semibold">{frame.filename || 'unknown'}</span>
                      <span className="text-zinc-600">in</span>
                      <span className="text-white font-mono">{frame.function || '<anonymous>'}</span>
                      {frame.lineno && <span className="text-zinc-500">at line {frame.lineno}</span>}
                    </div>
                    {frame.context_line && (
                      <div className="bg-black rounded-xl p-3 text-zinc-300 overflow-x-auto border border-white/10 font-mono">
                        {frame.pre_context?.map((l: string, i: number) => <div key={`pre-${i}`} className="opacity-40">{l}</div>)}
                        <div className="bg-white/10 text-white -mx-3 px-3 py-0.5 font-bold">{frame.context_line}</div>
                        {frame.post_context?.map((l: string, i: number) => <div key={`post-${i}`} className="opacity-40">{l}</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">No stack trace available.</div>
            )
          )}

          {activeTab === "breadcrumbs" && (
            events[0]?.breadcrumbs && events[0].breadcrumbs.length > 0 ? (
              <div className="relative p-6">
                <div className="absolute left-8 top-6 bottom-6 w-px bg-white/10"></div>
                <div className="space-y-6 relative">
                  {events[0].breadcrumbs.map((crumb, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-3 h-3 rounded-full mt-1 border-2 border-black bg-white shrink-0 z-10" />
                      <div className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white capitalize">{crumb.category}</span>
                          <span className="text-zinc-500 font-mono text-[11px]">{crumb.timestamp ? formatDistanceToNow(new Date(crumb.timestamp), { addSuffix: true }) : ''}</span>
                        </div>
                        <div className="text-zinc-400 font-mono">{crumb.message || (crumb.data ? JSON.stringify(crumb.data) : '')}</div>
                      </div>
                    </div>
                  ))}
                  {/* The crash event */}
                  <div className="flex gap-4">
                    <div className="w-3 h-3 rounded-full mt-1 border-2 border-black bg-white shrink-0 z-10 animate-ping" />
                    <div className="flex-1 bg-zinc-900 border border-white/20 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">Exception</span>
                        <span className="text-zinc-500 text-[11px] font-mono">Now</span>
                      </div>
                      <div className="text-white font-mono font-semibold">{issue.title}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">No breadcrumbs recorded for this event.</div>
            )
          )}

          {activeTab === "context" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {events[0] && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/10 pb-2">User Context</h3>
                    {events[0].user_id || events[0].user_email ? (
                      <div className="bg-black border border-white/10 rounded-xl p-3 text-xs space-y-2 font-mono">
                        {events[0].user_id && <div><span className="text-zinc-500 w-20 inline-block">ID:</span> <span className="text-white">{events[0].user_id}</span></div>}
                        {events[0].user_email && <div><span className="text-zinc-500 w-20 inline-block">Email:</span> <span className="text-white">{events[0].user_email}</span></div>}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 italic font-mono">No user context attached.</div>
                    )}

                    <h3 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/10 pb-2 pt-4">Environment</h3>
                    <div className="bg-black border border-white/10 rounded-xl p-3 text-xs space-y-2 font-mono">
                      <div><span className="text-zinc-500 w-24 inline-block">Platform:</span> <span className="text-white capitalize">{events[0].platform || 'Unknown'}</span></div>
                      <div><span className="text-zinc-500 w-24 inline-block">Environment:</span> <span className="text-white capitalize">{events[0].environment}</span></div>
                      {events[0].browser && <div><span className="text-zinc-500 w-24 inline-block">Browser:</span> <span className="text-white">{events[0].browser}</span></div>}
                      {events[0].os && <div><span className="text-zinc-500 w-24 inline-block">OS:</span> <span className="text-white">{events[0].os}</span></div>}
                      {events[0].url && <div><span className="text-zinc-500 w-24 inline-block">URL:</span> <a href={events[0].url} target="_blank" rel="noreferrer" className="text-white underline break-all">{events[0].url}</a></div>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/10 pb-2">Tags</h3>
                    {events[0].tags && Object.keys(events[0].tags).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(events[0].tags).map(([k, v]) => (
                          <span key={k} className="bg-black text-zinc-300 border border-white/15 px-2 py-0.5 rounded text-xs font-mono">
                            <span className="text-zinc-500 mr-1">{k}:</span>{String(v)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 italic font-mono">No custom tags attached.</div>
                    )}

                    <h3 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/10 pb-2 pt-4">Metadata Payload</h3>
                    {events[0].extra && Object.keys(events[0].extra).length > 0 ? (
                      <pre className="bg-black border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-300 overflow-x-auto">
                        {JSON.stringify(events[0].extra, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-xs text-zinc-500 italic font-mono">No metadata payload.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "events" && (
            <div className="divide-y divide-white/5">
              {events.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs">No events logged yet.</div>
              ) : (
                events.map((ev, idx) => (
                  <div key={ev.id || idx} className="p-4 flex items-center justify-between gap-4 text-xs font-mono">
                    <div>
                      <p className="font-semibold text-white">{ev.message || "No error message"}</p>
                      <p className="text-zinc-500 mt-1">
                        Environment: <span className="text-zinc-300">{ev.environment}</span> &bull; OS: <span className="text-zinc-300">{ev.os || "unknown"}</span> &bull; Browser: <span className="text-zinc-300">{ev.browser || "unknown"}</span>
                      </p>
                    </div>
                    <span className="text-zinc-500 shrink-0">{formatDistanceToNow(new Date(ev.received_at), { addSuffix: true })}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "ai" && (
            <div className="p-6 space-y-4">
              {loadingInsight ? (
                <div className="py-8 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
                  <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-zinc-400">Analyzing stack traces & codebase telemetry...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {insightProvider && (
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] uppercase font-mono font-semibold text-white tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-white" /> Sentinel Engine
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">Provider: {insightProvider}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-200 space-y-2">
                    {insight}
                  </div>
                  
                  {/* Self Heal Trigger */}
                  {!healResult && (
                    <div className="pt-4 border-t border-white/10 mt-6">
                      <button 
                        onClick={() => setShowHealModal(true)}
                        className="bg-white text-black font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-zinc-200 transition flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Self-Heal (Open Pull Request)
                      </button>
                    </div>
                  )}

                  {/* Heal Result Display */}
                  {healResult && (
                    <div className="mt-8 border border-white/20 bg-black rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold">
                          <Check className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-base text-white">Sentinel Generated Patch</h3>
                      </div>
                      <p className="text-xs text-zinc-400">{healResult.message}</p>
                      
                      <div>
                        <h4 className="text-[10px] uppercase font-mono font-semibold text-zinc-500 mb-2 tracking-wider">Git Diff</h4>
                        <pre className="bg-zinc-950 border border-white/10 rounded-xl p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
                          {healResult.patch.split('\\n').map((line, i) => (
                            <div key={i} className={
                              line.startsWith('+') ? 'text-white bg-white/10 px-1 -mx-1' : 
                              line.startsWith('-') ? 'text-zinc-500 line-through px-1 -mx-1' : ''
                            }>
                              {line}
                            </div>
                          ))}
                        </pre>
                      </div>
                      
                      <a 
                        href={healResult.pr_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-black font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition"
                      >
                        Review Pull Request &rarr;
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Permission Modal */}
      {showHealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="w-5 h-5 text-white" />
              <h2 className="text-base font-semibold text-white">Grant Autonomous Repair Permission</h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sentinel SLM is preparing to branch your repository and stage a patch addressing: <strong className="text-white">{issue.title}</strong>.
            </p>
            
            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setShowHealModal(false)}
                disabled={healing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleSelfHeal();
                  setShowHealModal(false);
                }}
                disabled={healing}
                className="px-5 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition disabled:opacity-50 flex items-center gap-2"
              >
                {healing ? <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : null}
                Authorize Branch & PR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
