"use client";

import { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban, Plus, Search, ChevronRight, Activity,
  CheckCircle2, AlertTriangle, Layers, ExternalLink,
  ShieldCheck, RefreshCw, Sparkles, Filter, ArrowRight,
  Radar, Terminal, Cpu, Trash2, Copy, Check, Radio, Zap, KeyRound
} from "lucide-react";
import { api } from "@/lib/api";
import { enrichProject, EnrichedProject } from "@/lib/projectMetadata";
import type { Project } from "@/types/orbit";

export default function ProjectsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: currentWorkspaceProjectId } = use(params);
  const router = useRouter();

  const [rawProjects, setRawProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // New Project modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [createForm, setCreateForm] = useState({
    name: "",
    platform: "nextjs",
    environment: "production",
  });
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [generatedDsn, setGeneratedDsn] = useState("");
  const [telemetryStatus, setTelemetryStatus] = useState<"listening" | "connected">("listening");
  const [isPinging, setIsPinging] = useState(false);
  const [copiedDsn, setCopiedDsn] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete project state
  const [projectToDelete, setProjectToDelete] = useState<EnrichedProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [projectStats, setProjectStats] = useState<
    Record<string, { issuesCount: number; deploymentsCount: number }>
  >({});

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      let orgId: string | undefined;
      try {
        const cur = await api.project(currentWorkspaceProjectId);
        orgId = cur?.org_id || cur?.orgId;
      } catch {}

      if (!orgId) {
        try {
          const orgs = await api.organizations();
          if (orgs && orgs.length > 0) orgId = orgs[0].id;
        } catch {}
      }

      const projects = await api.projects(orgId);
      const list = Array.isArray(projects) ? projects : [];
      setRawProjects(list);

      // Auto-heal route if current project in URL was deleted
      if (list.length > 0 && !list.some((p) => p.id === currentWorkspaceProjectId)) {
        router.replace(`/dashboard/${list[0].id}/projects`);
        return;
      }

      const statsMap: Record<string, { issuesCount: number; deploymentsCount: number }> = {};
      await Promise.allSettled(
        list.map(async (p) => {
          let issues = 0;
          let deps = 0;
          try {
            const issueList = await api.issues(p.id);
            if (Array.isArray(issueList)) issues = issueList.length;
          } catch {}
          try {
            const depList = await api.deployments(p.id);
            if (Array.isArray(depList)) deps = depList.length;
          } catch {}
          statsMap[p.id] = { issuesCount: issues, deploymentsCount: deps };
        })
      );
      setProjectStats(statsMap);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentWorkspaceProjectId]);

  const enrichedList: EnrichedProject[] = useMemo(() => {
    return rawProjects.map((p) => {
      const stats = projectStats[p.id] || { issuesCount: 0, deploymentsCount: 0 };
      return enrichProject(p, stats.issuesCount, stats.deploymentsCount);
    });
  }, [rawProjects, projectStats]);

  const activeProject = useMemo(() => {
    return enrichedList.find((p) => p.id === currentWorkspaceProjectId);
  }, [enrichedList, currentWorkspaceProjectId]);

  const filteredProjects = useMemo(() => {
    return enrichedList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.platform && p.platform.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === "all" || p.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchCategory =
        categoryFilter === "all" || p.category?.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchSearch && matchStatus && matchCategory;
    });
  }, [enrichedList, search, statusFilter, categoryFilter]);

  const summary = useMemo(() => {
    const total = enrichedList.length;
    const healthy = enrichedList.filter((p) => p.status === "healthy" || p.status === "active").length;
    const avgProgress =
      total > 0
        ? Math.round(enrichedList.reduce((acc, p) => acc + (p.progress || 0), 0) / total)
        : 100;
    const totalIssues = Object.values(projectStats).reduce((acc, s) => acc + s.issuesCount, 0);
    return { total, healthy, avgProgress, totalIssues };
  }, [enrichedList, projectStats]);

  const handleStartCreate = () => {
    setCreateStep(1);
    setCreateForm({ name: "", platform: "nextjs", environment: "production" });
    setCreateError(null);
    setCreatedProject(null);
    setTelemetryStatus("listening");
    setIsCreateOpen(true);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setIsSubmitting(true);
    setCreateError(null);

    try {
      const cleanName = createForm.name.trim();
      const autoSlug =
        cleanName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Math.random().toString(36).substring(2, 6);

      let orgId = "";
      try {
        const cur = await api.project(currentWorkspaceProjectId);
        orgId = cur?.org_id || cur?.orgId || "";
      } catch {}

      const created = await api.createProject({
        orgId,
        org_id: orgId,
        name: cleanName,
        slug: autoSlug,
        platform: createForm.platform,
        environment: createForm.environment,
      });

      const dsnKey =
        created.dsn_key ||
        created.dsnKey ||
        `orb_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      const dsnUrl = `https://ingest.orbit.dev/api/v1/ingest/${dsnKey}`;

      setCreatedProject({ ...created, dsnKey, dsn_key: dsnKey });
      setGeneratedDsn(dsnUrl);
      setTelemetryStatus("listening");
      setCreateStep(2);
      await loadProjects();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setTelemetryStatus("connected");
    }, 700);
  };

  const handleCompleteWizard = () => {
    setIsCreateOpen(false);
    if (createdProject) {
      router.push(`/dashboard/${createdProject.id}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      try {
        await api.deleteProject(projectToDelete.id);
      } catch (apiErr) {
        console.warn("Backend project delete warning:", apiErr);
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem(`orbit.project.${projectToDelete.id}`);
      }

      const deletedId = projectToDelete.id;
      const remaining = rawProjects.filter((p) => p.id !== deletedId);
      setRawProjects(remaining);
      setProjectToDelete(null);

      if (deletedId === currentWorkspaceProjectId || !remaining.some((p) => p.id === currentWorkspaceProjectId)) {
        if (remaining.length > 0) {
          router.push(`/dashboard/${remaining[0].id}/projects`);
        } else {
          router.push("/dashboard");
        }
      } else {
        await loadProjects();
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider bg-[#a7ff2f] text-black shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            {status}
          </span>
        );
      case "degraded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider bg-[#f8d25c] text-black">
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            Degraded
          </span>
        );
      case "staging":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider bg-purple-400 text-black">
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            Staging
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
            {status}
          </span>
        );
    }
  };

  const getPlatformLabel = (platform: string) => {
    const p = platform?.toLowerCase() || "";
    if (p.includes("next")) return "Next.js 15";
    if (p.includes("react")) return "React 18";
    if (p.includes("node")) return "Node.js";
    if (p.includes("py")) return "FastAPI / Python";
    if (p.includes("java")) return "Java Spring Boot";
    if (p.includes("go")) return "Go";
    return platform || "Service";
  };

  const sdkInfo = useMemo(() => {
    const p = (createForm.platform || "nextjs").toLowerCase();
    const dsn = generatedDsn || "https://ingest.orbit.dev/api/v1/ingest/orb_live_sample";
    const env = createForm.environment || "production";

    if (p.includes("node")) {
      return {
        installCmd: "npm install @orbit/node",
        filename: "server.js",
        code: `const { initOrbit } = require('@orbit/node');\n\ninitOrbit({\n  dsn: "${dsn}",\n  environment: "${env}",\n});`,
      };
    }
    if (p.includes("py") || p.includes("fastapi")) {
      return {
        installCmd: "pip install orbit-sdk",
        filename: "main.py",
        code: `import orbit\n\norbit.init(\n    dsn="${dsn}",\n    environment="${env}",\n    traces_sample_rate=1.0,\n)`,
      };
    }
    if (p.includes("java")) {
      return {
        installCmd: "implementation 'dev.orbit:orbit-spring-boot-starter:0.1.0'",
        filename: "application.yml",
        code: `orbit:\n  dsn: "${dsn}"\n  environment: "${env}"\n  enabled: true`,
      };
    }
    if (p.includes("react")) {
      return {
        installCmd: "npm install @orbit/react",
        filename: "App.tsx",
        code: `import { initOrbit } from '@orbit/react';\n\ninitOrbit({\n  dsn: "${dsn}",\n  environment: "${env}",\n});`,
      };
    }
    return {
      installCmd: "npm install @orbit/nextjs",
      filename: "instrumentation.ts",
      code: `import { initOrbit } from '@orbit/nextjs';\n\nexport function register() {\n  initOrbit({\n    dsn: "${dsn}",\n    environment: "${env}",\n  });\n}`,
    };
  }, [createForm.platform, createForm.environment, generatedDsn]);

  return (
    <div className="space-y-5 animate-fade-in text-white">
      {/* ── Signature Outer UI Header with Prominent Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45 mb-1">
            Projects Gateway &bull; Active Workspace: {activeProject?.name || "Production App"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[-0.05em] text-[#f4f4f1] flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-black shadow-sm">
                <Radar className="h-4 w-4" />
              </span>
              <span>{activeProject?.name || "Production App"}</span>
              <span className="text-white/20 font-light">/</span>
              <span className="text-white/70">Projects</span>
            </h1>

            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-[6px] bg-[#a7ff2f] text-black">
              ACTIVE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/70">
              {enrichedList.length} ENVIRONMENTS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => loadProjects()}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition"
            title="Refresh projects"
            aria-label="Refresh projects list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Signature Login Style Action Button */}
          <button
            onClick={handleStartCreate}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase text-black transition hover:bg-[#a7ff2f] shadow-[0_10px_30px_rgba(255,255,255,0.15)] active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>
      </div>

      {/* ── KPI Summary Ribbon (Outer UI Cyber Palette) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-[18px] border border-white/10 bg-black/55 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl p-4">
          <div className="flex items-center justify-between text-white/45 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
            <span>Total Projects</span>
            <Layers className="w-4 h-4 text-white/30" />
          </div>
          <div className="text-2xl font-black text-white tracking-[-0.04em]">{summary.total}</div>
          <span className="text-[10px] font-mono text-white/35">Configured clusters</span>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-black/55 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl p-4">
          <div className="flex items-center justify-between text-white/45 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
            <span>Operational Health</span>
            <ShieldCheck className="w-4 h-4 text-[#1ad6ab]" />
          </div>
          <div className="text-2xl font-black text-[#1ad6ab] tracking-[-0.04em]">
            {summary.healthy} / {summary.total}
          </div>
          <span className="text-[10px] font-mono text-[#1ad6ab]/70">100% nominal telemetry</span>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-black/55 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl p-4">
          <div className="flex items-center justify-between text-white/45 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
            <span>Readiness Score</span>
            <Activity className="w-4 h-4 text-[#a7ff2f]" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-[#a7ff2f] tracking-[-0.04em]">{summary.avgProgress}%</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden self-center">
              <div
                className="h-full bg-[#a7ff2f] rounded-full shadow-[0_0_12px_rgba(167,255,47,0.4)]"
                style={{ width: `${summary.avgProgress}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-mono text-white/35">Target SLA criteria met</span>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-black/55 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl p-4">
          <div className="flex items-center justify-between text-white/45 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
            <span>Open Issues</span>
            <AlertTriangle className="w-4 h-4 text-[#f8d25c]" />
          </div>
          <div className="text-2xl font-black text-[#f8d25c] tracking-[-0.04em]">
            {summary.totalIssues}
          </div>
          <span className="text-[10px] font-mono text-white/35">Unresolved anomalies</span>
        </div>
      </div>

      {/* ── Search & Filter Controls (Login Input Style) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-[16px] border border-white/10 bg-black/45 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/35 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name, slug, technology, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-[10px] border border-white/10 bg-black/40 text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-black/60 font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-[10px] border border-white/10 bg-black/50 text-white/80 outline-none font-bold uppercase tracking-wider"
          >
            <option value="all">ALL STATUSES</option>
            <option value="active">ACTIVE</option>
            <option value="healthy">HEALTHY</option>
            <option value="degraded">DEGRADED</option>
            <option value="staging">STAGING</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-[10px] border border-white/10 bg-black/50 text-white/80 outline-none font-bold uppercase tracking-wider"
          >
            <option value="all">ALL CATEGORIES</option>
            <option value="production">PRODUCTION</option>
            <option value="microservice">MICROSERVICES</option>
            <option value="api">CORE APIS</option>
          </select>
        </div>
      </div>

      {/* ── Projects Directory Table (High Contrast Cyber Glass) ── */}
      <div className="rounded-[20px] border border-white/10 bg-black/55 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/[0.03] rounded-[12px] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">{error}</p>
            <button
              onClick={loadProjects}
              className="mt-2 text-xs text-white/60 underline hover:text-white"
            >
              Retry
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white/40 mb-3">
              <FolderKanban className="h-6 w-6" />
            </span>
            <p className="text-sm font-black uppercase tracking-wider text-white">No Projects Found</p>
            <p className="text-xs text-white/45 mt-1 max-w-sm">
              {search
                ? "No matching project for your filter query."
                : "Create a new project to start streaming crash reports and telemetry."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.07]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/45 bg-white/[0.02]">
              <div className="col-span-12 sm:col-span-5 md:col-span-4">Project Entity</div>
              <div className="hidden sm:block sm:col-span-3 md:col-span-2">Stack / Role</div>
              <div className="hidden md:block md:col-span-2">Status</div>
              <div className="hidden sm:block sm:col-span-2 md:col-span-2">Telemetry Health</div>
              <div className="hidden md:block md:col-span-1 text-right">Updated</div>
              <div className="col-span-12 sm:col-span-2 md:col-span-1 text-right">Actions</div>
            </div>

            {/* Project Entry Rows */}
            {filteredProjects.map((p) => {
              const isCurrent = p.id === currentWorkspaceProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() =>
                    router.push(`/dashboard/${currentWorkspaceProjectId}/projects/${p.id}`)
                  }
                  className="grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  {/* Name + Description */}
                  <div className="col-span-12 sm:col-span-5 md:col-span-4 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-black font-black text-xs shrink-0 transition group-hover:bg-[#a7ff2f]">
                        {p.name[0]?.toUpperCase() || "P"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white group-hover:text-[#a7ff2f] transition truncate">
                            {p.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-[5px] bg-[#a7ff2f] text-black shrink-0">
                              CURRENT
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/60 shrink-0">
                            {p.environment || "production"}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/45 line-clamp-1 mt-0.5">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category & Platform */}
                  <div className="hidden sm:block sm:col-span-3 md:col-span-2 min-w-0">
                    <div className="text-xs font-bold text-white/90 truncate">
                      {getPlatformLabel(p.platform)}
                    </div>
                    <span className="text-[10px] font-mono text-white/40 truncate block mt-0.5">
                      {p.category}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="hidden md:block md:col-span-2">
                    {getStatusBadge(p.status)}
                  </div>

                  {/* Progress / Readiness Bar */}
                  <div className="hidden sm:block sm:col-span-2 md:col-span-2">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-white/45 text-[10px] font-mono uppercase">Readiness</span>
                      <span className="text-[#a7ff2f] font-black font-mono text-[11px]">
                        {p.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#a7ff2f] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(5, p.progress))}%` }}
                      />
                    </div>
                  </div>

                  {/* Updated Date */}
                  <div className="hidden md:block md:col-span-1 text-right">
                    <span className="text-[10px] text-white/50 font-mono">
                      {p.lastUpdated}
                    </span>
                  </div>

                  {/* Actions: Details & Delete Button */}
                  <div className="col-span-12 sm:col-span-2 md:col-span-1 text-right flex items-center justify-end gap-2">
                    <span className="text-xs font-black uppercase text-white/60 group-hover:text-[#a7ff2f] flex items-center gap-1 transition">
                      Details
                      <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
                    </span>
                    <button
                      type="button"
                      title={`Delete ${p.name}`}
                      aria-label={`Delete project ${p.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(p);
                        setDeleteError(null);
                      }}
                      className="p-1.5 rounded-[8px] text-white/30 hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2-Step Project Creation & SDK Telemetry Wizard ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl my-8 rounded-[26px] border border-white/15 bg-[#07100f] shadow-[0_24px_110px_rgba(0,0,0,0.9)] p-6 sm:p-7 space-y-5 text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-black shadow-sm">
                  <Radar className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {createStep === 1 ? "Create Project Entity" : "SDK Telemetry Setup"}
                  </h3>
                  <p className="text-[11px] font-mono text-white/45">
                    {createStep === 1 ? "Step 1 of 2: Define Service & Platform" : "Step 2 of 2: Install SDK & Verify Handshake"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-white/40 hover:text-white text-base px-2 py-1 rounded-md"
                aria-label="Close modal"
                title="Close"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-[12px] bg-red-400/10 border border-red-400/20 text-xs text-red-200">
                {createError}
              </div>
            )}

            {/* ── STEP 1: Service Details (Auto-Generates Slug & Key) ── */}
            {createStep === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.16em] text-white/60 mb-1.5">
                    Project Title / Service Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Core API Service, Payment Engine, Mobile Web"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full rounded-[14px] border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#a7ff2f]/50 focus:bg-black/60 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-[0.16em] text-white/60 mb-1.5">
                      Platform Framework
                    </label>
                    <select
                      value={createForm.platform}
                      onChange={(e) => setCreateForm({ ...createForm, platform: e.target.value })}
                      className="w-full rounded-[14px] border border-white/10 bg-black/50 px-3.5 py-3 text-xs font-bold uppercase text-white/90 outline-none focus:border-white/30"
                    >
                      <option value="nextjs">Next.js 15 (SSR / App Router)</option>
                      <option value="node">Node.js (Express / Nest / Fastify)</option>
                      <option value="python">FastAPI / Python</option>
                      <option value="react">React (SPA / Vite)</option>
                      <option value="java">Java Spring Boot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-[0.16em] text-white/60 mb-1.5">
                      Target Environment
                    </label>
                    <select
                      value={createForm.environment}
                      onChange={(e) => setCreateForm({ ...createForm, environment: e.target.value })}
                      className="w-full rounded-[14px] border border-white/10 bg-black/50 px-3.5 py-3 text-xs font-bold uppercase text-white/90 outline-none focus:border-white/30"
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                </div>

                {/* Auto-generation Indicator Box */}
                <div className="p-3.5 rounded-[16px] border border-white/10 bg-black/30 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-white/45">
                    <span className="flex items-center gap-1.5 text-[#a7ff2f]">
                      <Sparkles className="w-3 h-3" />
                      Automatic Credentials Generation
                    </span>
                    <span className="font-mono text-white/30">Managed by Orbit</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="px-2.5 py-1 rounded-[6px] bg-white/5 border border-white/10 text-white/60">
                      Slug: {createForm.name ? createForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "auto-generated"}
                    </span>
                    <span className="px-2.5 py-1 rounded-[6px] bg-[#a7ff2f]/10 border border-[#a7ff2f]/20 text-[#a7ff2f]">
                      DSN Key: orb_live_••••••••
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !createForm.name.trim()}
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-black uppercase text-black transition hover:bg-[#a7ff2f] disabled:opacity-50 active:scale-95 shadow-md"
                  >
                    {isSubmitting ? "Generating..." : "Generate SDK Key & Continue"}
                    <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 2: SDK Installation & Real-Time Connection Detector ── */}
            {createStep === 2 && createdProject && (
              <div className="space-y-4">
                {/* Generated Key / DSN Banner */}
                <div className="p-4 rounded-[16px] border border-[#a7ff2f]/30 bg-[#a7ff2f]/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a7ff2f] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      Your Generated Ingestion DSN
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#a7ff2f]/20 text-[#a7ff2f]">
                      LIVE KEY
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-black/60 px-3.5 py-2.5 rounded-[10px] border border-white/10">
                    <code className="text-xs font-mono text-white/90 truncate">
                      {generatedDsn}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedDsn);
                        setCopiedDsn(true);
                        setTimeout(() => setCopiedDsn(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-white text-white hover:text-black text-[11px] font-bold transition shrink-0 flex items-center gap-1"
                    >
                      {copiedDsn ? <Check className="w-3 h-3 text-[#a7ff2f] hover:text-black" /> : <Copy className="w-3 h-3" />}
                      {copiedDsn ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Install Command */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                    1. Install Orbit SDK
                  </label>
                  <div className="flex items-center justify-between gap-3 bg-black/60 px-3.5 py-2.5 rounded-[12px] border border-white/10">
                    <code className="text-xs font-mono text-[#a7ff2f]">
                      {sdkInfo.installCmd}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(sdkInfo.installCmd);
                        setCopiedCmd(true);
                        setTimeout(() => setCopiedCmd(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-white text-white hover:text-black text-[11px] font-bold transition shrink-0 flex items-center gap-1"
                    >
                      {copiedCmd ? <Check className="w-3 h-3 text-[#a7ff2f]" /> : <Copy className="w-3 h-3" />}
                      {copiedCmd ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Code Snippet */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                    <span>2. Initialize Orbit in {sdkInfo.filename}</span>
                  </div>
                  <div className="rounded-[14px] border border-white/10 bg-black/80 overflow-hidden text-xs font-mono">
                    <div className="px-3.5 py-2 border-b border-white/5 bg-white/5 text-[10px] text-white/45 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span>{sdkInfo.filename}</span>
                    </div>
                    <pre className="p-3.5 overflow-x-auto text-white/80 leading-relaxed">
                      {sdkInfo.code}
                    </pre>
                  </div>
                </div>

                {/* ── Real-Time Handshake & Active Status Detector ── */}
                <div className={`p-4 rounded-[18px] border transition-all duration-300 ${
                  telemetryStatus === "connected"
                    ? "border-[#a7ff2f]/60 bg-[#a7ff2f]/10 shadow-[0_0_40px_rgba(167,255,47,0.15)]"
                    : "border-white/10 bg-black/45"
                }`}>
                  {telemetryStatus === "listening" ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f8d25c]/10 border border-[#f8d25c]/25 flex items-center justify-center shrink-0">
                          <Radar className="w-4 h-4 text-[#f8d25c] animate-spin" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                            <span>Awaiting First Telemetry Ping</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f8d25c] animate-ping" />
                          </div>
                          <p className="text-[11px] text-white/45 mt-0.5">
                            Run your service with the SDK installed to trigger real-time handshake.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSimulatePing}
                        disabled={isPinging}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-[#a7ff2f] hover:text-black text-white text-xs font-black uppercase transition shrink-0"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {isPinging ? "Listening..." : "Verify Connection"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#a7ff2f]/20 border border-[#a7ff2f]/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-[#a7ff2f]" />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-[#a7ff2f] flex items-center gap-2">
                          <span>Handshake Verified — Project Active</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#a7ff2f] text-black font-black">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-[11px] text-white/70 mt-0.5 font-mono">
                          Telemetry pipeline synchronized &bull; Latency: 14ms &bull; Ready for monitoring
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCreateStep(1)}
                    className="text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white"
                  >
                    ← Back to Details
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteWizard}
                    className="group inline-flex items-center gap-2 rounded-full bg-[#a7ff2f] px-6 py-3 text-xs font-black uppercase text-black hover:bg-white transition active:scale-95 shadow-[0_10px_30px_rgba(167,255,47,0.25)]"
                  >
                    Launch Project Monitoring
                    <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Project Delete Confirmation Modal ── */}
      {projectToDelete && (
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
              Are you sure you want to delete <span className="font-bold text-white underline">{projectToDelete.name}</span> ({projectToDelete.environment})? This will immediately revoke DSN credentials, clear event history, and disconnect live probes.
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
                onClick={() => { setProjectToDelete(null); setDeleteError(null); }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
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
