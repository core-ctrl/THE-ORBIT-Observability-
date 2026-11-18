"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, AlertCircle, Activity, Clock, Server, Container,
  Database, FileText, Bell, Settings, BookOpen, ChevronDown,
  Flame, GitCommit, BarChart3, LogOut, Palette, FolderKanban, Boxes, Code2, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { OrbitLogo } from "@/components/ui/orbit-logo";
import { useOrbitStore } from "@/store/orbitStore";
import { api, clearToken } from "@/lib/api";
import type { Project } from "@/types/orbit";

const navSections = [
  {
    label: "Workspace",
    items: [
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Overview", href: "", icon: LayoutDashboard },
      { name: "Cloud IDE", href: "/ide", icon: Code2 },
    ],
  },
  {
    label: "Monitor",
    items: [
      { name: "Issues", href: "/issues", icon: AlertCircle },
      { name: "Incidents", href: "/incidents", icon: Flame },
      { name: "Performance", href: "/performance", icon: Activity },
      { name: "Metrics", href: "/metrics", icon: BarChart3 },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Uptime", href: "/uptime", icon: Clock },
      { name: "Infrastructure", href: "/infrastructure", icon: Server },
      { name: "Docker", href: "/docker", icon: Container },
      { name: "Databases", href: "/databases", icon: Database },
    ],
  },
  {
    label: "Explore",
    items: [
      { name: "Logs", href: "/logs", icon: FileText },
      { name: "Deployments", href: "/deployments", icon: GitCommit },
      { name: "Alerts", href: "/alerts", icon: Bell },
    ],
  },
];

export function Sidebar() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const baseUrl = projectId ? `/dashboard/${projectId}` : '';

  const [projectName, setProjectName] = useState("Orbit");
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [unresolvedCount, setUnresolvedCount] = useState<number | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const guardianSidebarOpen = useOrbitStore((s) => s.guardianSidebarOpen);
  const toggleGuardianSidebar = useOrbitStore((s) => s.toggleGuardianSidebar);
  const sidebarOpen = useOrbitStore((s) => s.sidebarOpen);
  const setSidebarOpen = useOrbitStore((s) => s.setSidebarOpen);

  useEffect(() => {
    // Automatically close sidebar on mobile navigation
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const fetchUnresolvedCount = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    try {
      const data = await api.issues(projectId, { status: "unresolved" });
      if (Array.isArray(data)) {
        setUnresolvedCount(data.length);
      }
    } catch { }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      try {
        const projectData = await api.project(projectId);
        if (projectData?.name) setProjectName(projectData.name);

        if (projectData?.org_id) {
          const projects = await api.projects(projectData.org_id);
          if (Array.isArray(projects)) setProjectsList(projects);
        }
      } catch {
        // Project ID in URL no longer exists (e.g. was deleted)
        // Gracefully locate the first valid project and navigate to it
        try {
          const orgs = await api.organizations();
          if (orgs && orgs.length > 0) {
            const allProjects = await api.projects(orgs[0].id);
            if (Array.isArray(allProjects) && allProjects.length > 0) {
              const fallback = allProjects[0];
              if (fallback.id !== projectId) {
                router.replace(`/dashboard/${fallback.id}/projects`);
                return;
              }
            }
          }
        } catch { }
      }

      try {
        const userData = await api.me();
        if (userData?.name) setUserName(userData.name);
        if (userData?.email) setUserEmail(userData.email);
      } catch { }
    };

    loadData();
    fetchUnresolvedCount();
    const interval = setInterval(fetchUnresolvedCount, 15000);

    const handleVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchUnresolvedCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [projectId, fetchUnresolvedCount]);

  const switchProject = (id: string) => {
    setShowProjectDropdown(false);
    const pathSegments = pathname.split("/");
    if (pathSegments.length > 3) {
      const restPath = pathSegments.slice(4).join("/");
      router.push(`/dashboard/${id}/${restPath || "issues"}`);
    } else {
      router.push(`/dashboard/${id}/issues`);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-[240px] border-r border-[var(--glass-border)] flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        style={{ background: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)' }}
      >
        {/* Brand & Workspace Switcher Header */}
        <div className="relative border-b border-[var(--glass-border)] p-3">
          {/* Brand identity */}
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <OrbitLogo href={projectId ? `/dashboard/${projectId}` : "/dashboard"} badge="PLATFORM" />
          </div>

          {/* Project Switcher Pill */}
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] transition-all group text-left cursor-pointer shadow-sm"
            title="Switch Active Project"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105">
                <Boxes className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate transition-colors">
                  {projectName}
                </span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                  production
                </span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform duration-200 shrink-0 ${showProjectDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showProjectDropdown && (
            <div className="absolute left-3 right-3 top-[92px] glass-card-elevated py-1.5 z-50 animate-scale-in shadow-2xl rounded-xl border border-[var(--glass-border-hover)] bg-[var(--bg-card)]">
              <div className="px-3 py-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--glass-border)] mb-1 flex items-center justify-between">
                <span>Switch Workspace</span>
                <span className="text-[9px] font-mono">{projectsList.length} active</span>
              </div>
              <div className="max-h-48 overflow-y-auto scrollbar">
                {projectsList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => switchProject(p.id)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5 flex items-center justify-between truncate ${p.id === projectId
                        ? "text-white font-semibold bg-white/10 border-l-2 border-white"
                        : "text-zinc-300 hover:text-white"
                      }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {p.id === projectId && (
                      <span className="text-[10px] text-white font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10 mt-1 pt-1 px-2">
                <Link
                  href="/dashboard/projects"
                  className="w-full text-left px-2 py-1 text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
                >
                  + View all projects
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar py-3 px-2 flex flex-col gap-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="px-2 mb-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {section.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const fullHref = `${baseUrl}${item.href}`;
                  const isActive =
                    pathname === fullHref ||
                    (item.href !== "" && pathname?.startsWith(fullHref));
                  const hasBadge =
                    item.name === "Issues" &&
                    unresolvedCount !== null &&
                    unresolvedCount > 0;

                  return (
                    <Link
                      key={item.name}
                      href={fullHref}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {hasBadge && (
                        <span className="text-[10px] px-1.5 py-0 h-4 min-w-4 rounded-full flex items-center justify-center font-mono font-bold bg-white text-black">
                          {unresolvedCount}
                        </span>
                      )}
                      {item.name === "Cloud IDE" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-black font-mono font-bold uppercase tracking-wider">
                          SLM
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="p-2 border-t border-[var(--glass-border)] flex flex-col gap-0.5">
          <button
            type="button"
            onClick={toggleGuardianSidebar}
            className={`sidebar-link w-full text-left cursor-pointer transition ${guardianSidebarOpen ? "active" : ""
              }`}
            title="Talk with Orbit Guardian AI Sentinel (Ctrl+Shift+G)"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 stroke-[1.5] text-white" />
              <span className="truncate text-zinc-300 group-hover:text-white">Guardian AI</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20 font-mono font-bold uppercase tracking-wider">
              CHAT
            </span>
          </button>

          <Link
            href={`${baseUrl}/appearance`}
            className={`sidebar-link ${pathname?.includes("/appearance") ? "active" : ""}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Palette className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
              <span className="truncate">Appearance</span>
            </div>
          </Link>
          <Link
            href="/settings"
            className={`sidebar-link ${pathname?.includes("/settings") ? "active" : ""}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Settings className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
              <span className="truncate">Settings</span>
            </div>
          </Link>
          <Link
            href={`${baseUrl}/docs`}
            className="sidebar-link"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <BookOpen className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
              <span className="truncate">Docs</span>
            </div>
          </Link>

          {/* Theme & User */}
          <div className="mt-2 pt-2 border-t border-[var(--glass-border)] space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold tracking-wider">Theme</span>
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-colors group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold bg-white text-black shrink-0">
                {userName[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <span className="text-xs font-medium text-[var(--text-primary)] truncate">{userName}</span>
                {userEmail && (
                  <span className="text-[10px] text-[var(--text-muted)] truncate">{userEmail}</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[var(--glass-bg-elevated)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-all"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
