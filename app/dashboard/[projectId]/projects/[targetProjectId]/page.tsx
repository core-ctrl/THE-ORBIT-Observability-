"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FolderKanban, ShieldCheck, Activity, Copy, Check,
  ExternalLink, Calendar, Code2, Layers, CheckCircle2,
  Clock, AlertTriangle, Cpu, Terminal, Sparkles, Settings,
  Radio, Play, Bug, GitCommit, ArrowRight, Server, Radar, Trash2
} from "lucide-react";
import { api } from "@/lib/api";
import { enrichProject, saveProjectMetadata, EnrichedProject } from "@/lib/projectMetadata";
import type { Project, Issue, Deployment } from "@/types/orbit";

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string; targetProjectId: string }>;
}) {
  const { projectId: currentWorkspaceId, targetProjectId } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<EnrichedProject | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [copiedDsn, setCopiedDsn] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "milestones" | "stack" | "telemetry">("overview");

  // Project Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteProject = async () => {
    if (!project) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      try {
        await api.deleteProject(project.id);
      } catch (err) {
        console.warn("Backend delete warning:", err);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(`orbit.project.${project.id}`);
      }
      setShowDeleteModal(false);
      router.push(`/dashboard/${currentWorkspaceId}/projects`);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const rawProj = await api.project(targetProjectId);
        if (!rawProj) {
          throw new Error("Project not found");
        }

        let projectIssues: Issue[] = [];
        let projectDeployments: Deployment[] = [];
        try {
          projectIssues = await api.issues(targetProjectId);
        } catch {}
        try {
          projectDeployments = await api.deployments(targetProjectId);
        } catch {}

        setIssues(projectIssues);
        setDeployments(projectDeployments);

        const enriched = enrichProject(
          rawProj,
          projectIssues.length,
          projectDeployments.length
        );
        setProject(enriched);
      } catch (err) {
        console.error("Failed to load project details:", err);
        setError(err instanceof Error ? err.message : "Project not found");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [targetProjectId]);

  const copyToClipboard = (text: string, type: "dsn" | "token") => {
    navigator.clipboard.writeText(text);
    if (type === "dsn") {
      setCopiedDsn(true);
      setTimeout(() => setCopiedDsn(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const switchToWorkspace = () => {
    if (!project) return;
    router.push(`/dashboard/${project.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-44 bg-white/5 rounded-full animate-pulse" />
        <div className="h-28 bg-white/[0.03] border border-white/10 rounded-[20px] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-36 bg-white/[0.03] border border-white/10 rounded-[20px] animate-pulse" />
          <div className="h-36 bg-white/[0.03] border border-white/10 rounded-[20px] animate-pulse" />
          <div className="h-36 bg-white/[0.03] border border-white/10 rounded-[20px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4 animate-fade-in text-white">
        <Link
          href={`/dashboard/${currentWorkspaceId}/projects`}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white/50 hover:text-[#a7ff2f] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>
        <div className="p-8 text-center rounded-[20px] border border-white/10 bg-black/60 backdrop-blur-xl">
          <AlertTriangle className="w-8 h-8 text-[#f8d25c] mx-auto mb-2" />
          <p className="text-sm font-black uppercase text-white">{error || "Project Not Found"}</p>
          <p className="text-xs text-white/45 mt-1">
            Unable to load the requested project entity.
          </p>
          <Link
            href={`/dashboard/${currentWorkspaceId}/projects`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase text-black hover:bg-[#a7ff2f] transition"
          >
            Return to Projects Overview
          </Link>
        </div>
      </div>
    );
  }

  const dsnValue = project.dsnKey || project.dsn_key || "dsn_key_unavailable";
  const ingestTokenValue = project.ingestToken || project.ingest_token || "ingest_token_unavailable";
  const createdDate = project.created_at || project.createdAt;
  const formattedCreated = createdDate
    ? new Date(createdDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="space-y-5 animate-fade-in text-white">
      {/* ── Breadcrumb & Back Navigation ── */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 text-xs">
          <Link
            href={`/dashboard/${currentWorkspaceId}/projects`}
            className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white/50 hover:text-[#a7ff2f] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Projects
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white font-black uppercase tracking-wider text-xs">{project.name}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push(`/dashboard/${project.id}`)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#a7ff2f] px-4 py-2 text-xs font-black uppercase text-black hover:bg-white transition shadow-sm active:scale-95"
          >
            <Activity className="w-3.5 h-3.5" />
            Launch Monitoring
          </button>

          <button
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500 hover:text-black px-3.5 py-2 text-xs font-black uppercase text-red-400 transition shadow-sm active:scale-95"
            title="Delete this project"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* ── Project Master Entity Card ── */}
      <div className="rounded-[22px] border border-white/10 bg-black/55 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-black font-black text-base shrink-0 shadow-sm">
              {project.name[0]?.toUpperCase() || "P"}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-[-0.04em] text-white">
                  {project.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/70">
                  {project.slug}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/70 uppercase">
                  {project.environment || "production"}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-[5px] bg-[#a7ff2f] text-black">
                  {project.status || "healthy"}
                </span>
              </div>
              <p className="text-xs text-white/55 mt-1.5 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-5 self-start md:self-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
            <div className="text-right">
              <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/40">
                Readiness
              </div>
              <div className="text-xl font-black text-[#a7ff2f] tracking-tight">
                {project.progress}%
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-right">
              <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/40">
                Issues
              </div>
              <div className="text-xl font-black text-white/80 tracking-tight">
                {issues.length}
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-right">
              <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/40">
                Stack
              </div>
              <div className="text-xs font-black uppercase text-[#1ad6ab] tracking-tight">
                {project.platform}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modern Cyber Tabs ── */}
      <div className="flex items-center gap-2 border-b border-white/10 text-xs font-black uppercase tracking-[0.18em]">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === "overview"
              ? "border-[#a7ff2f] text-[#a7ff2f]"
              : "border-transparent text-white/45 hover:text-white"
          }`}
        >
          Objectives
        </button>
        <button
          onClick={() => setActiveTab("milestones")}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === "milestones"
              ? "border-[#a7ff2f] text-[#a7ff2f]"
              : "border-transparent text-white/45 hover:text-white"
          }`}
        >
          Milestones ({project.milestones.length})
        </button>
        <button
          onClick={() => setActiveTab("stack")}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === "stack"
              ? "border-[#a7ff2f] text-[#a7ff2f]"
              : "border-transparent text-white/45 hover:text-white"
          }`}
        >
          Tech Architecture ({project.techStack.length})
        </button>
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === "telemetry"
              ? "border-[#a7ff2f] text-[#a7ff2f]"
              : "border-transparent text-white/45 hover:text-white"
          }`}
        >
          SDK & Keys
        </button>
      </div>

      {/* Tab 1: Objectives & Telemetry */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-[20px] border border-white/10 bg-black/55 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#1ad6ab]" />
                  Key Strategic Objectives
                </h3>
                <span className="text-[10px] font-mono text-white/40">
                  {project.objectives.length} active targets
                </span>
              </div>

              <div className="space-y-2.5">
                {project.objectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-[14px] bg-white/[0.02] border border-white/5"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1ad6ab]/15 text-[#1ad6ab] shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-xs text-white/80 leading-relaxed font-medium">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/55 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45 flex items-center gap-2">
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  Telemetry Crashes & Anomalies
                </h3>
                <Link
                  href={`/dashboard/${project.id}/issues`}
                  className="text-[11px] font-bold text-[#a7ff2f] hover:underline flex items-center gap-1"
                >
                  View in Issues <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {issues.length === 0 ? (
                <div className="p-6 text-center rounded-[14px] bg-white/[0.01] border border-white/5">
                  <CheckCircle2 className="w-6 h-6 text-[#a7ff2f] mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-black uppercase text-white">Zero Active Crashes</p>
                  <p className="text-[11px] text-white/45 mt-0.5">
                    No exceptions or unresolved bugs in this workspace.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {issues.slice(0, 4).map((issue) => (
                    <div
                      key={issue.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{issue.title}</div>
                        <div className="text-[10px] font-mono text-white/40 truncate">{issue.culprit}</div>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                        {issue.level}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[20px] border border-white/10 bg-black/55 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl p-5 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">
                Cluster Specifications
              </h3>

              <div className="space-y-2.5 text-xs divide-y divide-white/5">
                <div className="flex justify-between items-center pt-2 first:pt-0">
                  <span className="text-white/45">Project ID</span>
                  <span className="font-mono text-[10px] text-white/60 truncate max-w-[140px]">
                    {project.id}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white/45">Classification</span>
                  <span className="text-white font-bold">{project.category}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white/45">Zone</span>
                  <span className="text-white font-mono text-[11px]">{project.timezone || "UTC"}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white/45">Provisioned</span>
                  <span className="text-white font-mono text-[11px]">{formattedCreated}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white/45">Last Heartbeat</span>
                  <span className="text-white font-mono text-[11px]">{project.lastUpdated}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/55 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl p-5 space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45 mb-2">
                Workspace Controls
              </h3>

              <button
                onClick={switchToWorkspace}
                className="w-full flex items-center justify-between p-2.5 rounded-[12px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white transition group"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-[#a7ff2f]" />
                  Launch Workspace
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </button>

              <Link
                href={`/dashboard/${project.id}/performance`}
                className="w-full flex items-center justify-between p-2.5 rounded-[12px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white transition group"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#1ad6ab]" />
                  Live APM Traces
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href={`/dashboard/${project.id}/docker`}
                className="w-full flex items-center justify-between p-2.5 rounded-[12px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white transition group"
              >
                <span className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-white/70" />
                  Container Daemon
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </Link>

              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setDeleteError(null);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-[12px] bg-red-500/[0.04] hover:bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:text-red-300 transition group"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    Delete Project
                  </span>
                  <span className="text-[10px] font-mono text-red-400/60 uppercase">Danger</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Milestones */}
      {activeTab === "milestones" && (
        <div className="rounded-[20px] border border-white/10 bg-black/55 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Deliverable Milestones</h3>
              <p className="text-[11px] text-white/45">
                Lifecycle phases and engineering execution status
              </p>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-[#a7ff2f] text-black">
              {project.milestones.filter((m) => m.status === "completed").length} / {project.milestones.length} COMPLETE
            </span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/45 bg-white/[0.02]">
              <div className="col-span-5">Milestone Track</div>
              <div className="col-span-2">Execution</div>
              <div className="col-span-2">Target Date</div>
              <div className="col-span-2">Owner Lead</div>
              <div className="col-span-1 text-right">Readiness</div>
            </div>

            {project.milestones.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-12 gap-4 items-center px-5 py-3.5 hover:bg-white/[0.03] transition text-xs"
              >
                <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-black shrink-0 ${
                      m.status === "completed"
                        ? "bg-[#a7ff2f] text-black"
                        : m.status === "in_progress"
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {m.status === "completed" ? "✓" : "•"}
                  </span>
                  <span className="font-bold text-white truncate">{m.title}</span>
                </div>

                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      m.status === "completed"
                        ? "bg-[#a7ff2f] text-black"
                        : m.status === "in_progress"
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="col-span-2 text-white/50 font-mono text-[11px]">
                  {m.dueDate}
                </div>

                <div className="col-span-2 text-white/70 text-[11px] font-bold">{m.owner || "SRE"}</div>

                <div className="col-span-1 text-right font-mono text-[#a7ff2f] font-black text-[11px]">
                  {m.progressPercent ?? (m.status === "completed" ? 100 : 50)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Tech Stack */}
      {activeTab === "stack" && (
        <div className="rounded-[20px] border border-white/10 bg-black/55 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">System Architecture & Components</h3>
            <p className="text-[11px] text-white/45">
              Production runtime stack, database engines, and telemetry hooks
            </p>
          </div>

          <div className="divide-y divide-white/[0.06]">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/45 bg-white/[0.02]">
              <div className="col-span-4">Technology</div>
              <div className="col-span-4">Role</div>
              <div className="col-span-2">Domain</div>
              <div className="col-span-2 text-right">Release</div>
            </div>

            {project.techStack.map((tech, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-4 items-center px-5 py-3 hover:bg-white/[0.03] transition text-xs"
              >
                <div className="col-span-4 flex items-center gap-2 font-black text-white">
                  <Code2 className="w-3.5 h-3.5 text-[#1ad6ab]" />
                  {tech.name}
                </div>
                <div className="col-span-4 text-white/55 text-[11px]">{tech.role}</div>
                <div className="col-span-2">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/70">
                    {tech.category}
                  </span>
                </div>
                <div className="col-span-2 text-right font-mono text-[11px] text-white/50">
                  {tech.version || "stable"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Telemetry Credentials */}
      {activeTab === "telemetry" && (
        <div className="rounded-[20px] border border-white/10 bg-black/55 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-[#a7ff2f]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Project Ingestion Credentials
            </h3>
          </div>
          <p className="text-xs text-white/55">
            Connect your Next.js, Node, Python, or Java apps to Orbit using these secrets.
          </p>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-1.5">
                Orbit DSN Key (Client & Telemetry Ingestion)
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  readOnly
                  value={dsnValue}
                  className="flex-1 px-4 py-2.5 text-xs font-mono rounded-[12px] border border-white/10 bg-black/45 text-white select-all"
                />
                <button
                  onClick={() => copyToClipboard(dsnValue, "dsn")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase rounded-full bg-white text-black hover:bg-[#a7ff2f] transition"
                >
                  {copiedDsn ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-1.5">
                Ingest Token (Direct Observability Pipeline)
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  readOnly
                  value={ingestTokenValue}
                  className="flex-1 px-4 py-2.5 text-xs font-mono rounded-[12px] border border-white/10 bg-black/45 text-white select-all"
                />
                <button
                  onClick={() => copyToClipboard(ingestTokenValue, "token")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase rounded-full bg-white text-black hover:bg-[#a7ff2f] transition"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-1.5">
                Initialization Code Snippet
              </label>
              <pre className="p-4 rounded-[14px] bg-black/70 border border-white/10 text-[11px] font-mono text-white/85 overflow-x-auto leading-relaxed">
{`import { initOrbit, OrbitErrorBoundary } from "orbit-observability";

initOrbit({
  dsn: "${dsnValue}",
  endpoint: "http://localhost:8000",
  environment: "${project.environment || "production"}",
  tracesSampleRate: 1.0,
});`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── Project Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-[24px] border border-red-500/30 bg-[#07100f] shadow-[0_24px_110px_rgba(0,0,0,0.9)] p-6 space-y-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Delete Project Entity
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Permanent removal of telemetry pipeline
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-[14px] bg-red-500/[0.07] border border-red-500/20 text-xs text-red-200/90 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white underline">{project.name}</span> ({project.environment || "production"})? This will immediately revoke DSN credentials, clear event history, and disconnect live probes.
            </div>

            {deleteError && (
              <div className="p-3 rounded-[12px] bg-red-400/10 border border-red-400/20 text-xs text-red-200">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => { setShowDeleteModal(false); setDeleteError(null); }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProject}
                className="rounded-full bg-red-500 hover:bg-red-400 text-black px-5 py-2.5 text-xs font-black uppercase transition active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm & Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
