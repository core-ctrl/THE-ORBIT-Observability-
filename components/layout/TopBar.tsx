"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Bell, Activity, Server, Cpu, HardDrive, Check,
  User, Settings, Building2, Sliders, LogOut, ChevronDown,
  Radar, ShieldCheck, Key, Code2
} from "lucide-react";
import { useOrbitStore } from "@/store/orbitStore";
import { formatDistanceToNow } from "date-fns";
import { api, clearToken } from "@/lib/api";
import type { UserProfile } from "@/types/orbit";

export function TopBar() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const projectId = params?.projectId as string | undefined;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projectName, setProjectName] = useState<string>("Production App");

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const connected = useOrbitStore((s) => s.connected);
  const alerts = useOrbitStore((s) => s.alerts);
  const system = useOrbitStore((s) => s.system);
  const guardianSidebarOpen = useOrbitStore((s) => s.guardianSidebarOpen);
  const toggleGuardianSidebar = useOrbitStore((s) => s.toggleGuardianSidebar);

  const unread = alerts.slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const u = await api.me();
        if (u) setUser(u);
      } catch {}

      if (projectId) {
        try {
          const p = await api.project(projectId);
          if (p?.name) setProjectName(p.name);
        } catch {}
      }
    };
    loadProfile();
  }, [projectId]);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  const getSectionTitle = () => {
    if (!pathname) return "DASHBOARD";
    if (pathname.includes("/ide")) return "CLOUD IDE";
    if (pathname.includes("/projects")) return "PROJECTS";
    if (pathname.includes("/docker")) return "DOCKER";
    if (pathname.includes("/issues")) return "ISSUES";
    if (pathname.includes("/incidents")) return "INCIDENTS";
    if (pathname.includes("/performance")) return "PERFORMANCE";
    if (pathname.includes("/metrics")) return "METRICS";
    if (pathname.includes("/infrastructure")) return "INFRA";
    if (pathname.includes("/uptime")) return "UPTIME";
    if (pathname.includes("/databases")) return "DATABASES";
    if (pathname.includes("/logs")) return "LOGS";
    if (pathname.includes("/deployments")) return "DEPLOYMENTS";
    if (pathname.includes("/alerts")) return "ALERTS";
    if (pathname.includes("/settings")) return "SETTINGS";
    if (pathname.includes("/appearance")) return "APPEARANCE";
    if (pathname.includes("/docs")) return "DOCS";
    return "OVERVIEW";
  };

  const currentSection = getSectionTitle();
  const userName = user?.name || "Orbit Administrator";
  const userEmail = user?.email || "admin@orbit.dev";
  const userRole = user?.role || "ADMIN";
  const userPlan = user?.plan || "ENTERPRISE";

  return (
    <header 
      className="h-16 border-b border-[var(--topbar-border)] backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between transition-colors duration-300"
      style={{ background: 'var(--header-bg)' }}
    >
      {/* Left: Professional Breadcrumbs & Telemetry Status */}
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs min-w-0">
          <Link
            href="/dashboard/projects"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium transition-colors hidden sm:inline"
          >
            Projects
          </Link>
          <span className="text-[var(--text-muted)] opacity-40 hidden sm:inline">/</span>
          <Link
            href={projectId ? `/dashboard/${projectId}` : "/dashboard"}
            className="font-semibold text-white hover:text-zinc-300 transition-colors truncate max-w-[130px] sm:max-w-[190px]"
          >
            {projectName}
          </Link>
          <span className="text-zinc-500 opacity-40">/</span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-white px-2 py-0.5 rounded-md bg-white/10 border border-white/20 truncate">
            {currentSection}
          </span>
        </nav>

        {/* Web IDE Direct Action */}
        <Link
          href={projectId ? `/dashboard/${projectId}/ide` : "/dashboard"}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition shadow-sm"
          title="Open Orbit Cloud IDE"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Web IDE</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-white text-black font-mono font-bold uppercase tracking-wider">SLM</span>
        </Link>

        {/* Live Telemetry Stream Indicator */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-zinc-900/60 border border-white/10 shadow-sm">
          <span className="relative flex h-2 w-2">
            {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? "bg-white" : "border border-white/40"}`} />
          </span>
          <span className={connected ? "text-white font-semibold" : "text-zinc-400 font-semibold"}>
            {connected ? "Core Online" : "Disconnected"}
          </span>
        </div>

        {/* System Resource Telemetry */}
        {system && (
          <div className="hidden xl:flex items-center gap-2.5 px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-white/10 text-[10px] font-mono text-zinc-300">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-white" />
              <span>{system.cpu_percent.toFixed(0)}% CPU</span>
            </div>
            <span className="text-zinc-600">·</span>
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-white" />
              <span>{system.memory_percent.toFixed(0)}% RAM</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Hostname, Notifications, and Signature User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {system && (
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-white/10">
            <Server className="w-3 h-3 text-white" />
            <span>{system.hostname}</span>
          </div>
        )}

        {/* Orbit Guardian AI Sentinel Chat Toggle */}
        <button
          onClick={toggleGuardianSidebar}
          className={`h-8 px-2 sm:px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition shadow-sm cursor-pointer ${
            guardianSidebarOpen
              ? "bg-white text-black border-white"
              : "bg-zinc-900/60 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white"
          }`}
          title="Toggle Orbit Guardian AI Chat (Ctrl+Shift+G)"
          aria-label="Toggle Orbit Guardian AI Chat"
        >
          <div className="relative flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-current" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
          <span className="hidden sm:inline font-mono text-[11px] font-bold">Guardian AI</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="w-8 h-8 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white relative transition shadow-sm"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unread.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-black rounded-full text-[9px] text-black flex items-center justify-center font-mono font-bold">
                {unread.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-72 sm:w-80 rounded-2xl border border-[var(--border-hover)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-150">
              <div className="p-3.5 border-b border-white/10 bg-zinc-950 flex items-center justify-between">
                <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-white" />
                  Alerts & Incidents
                </span>
                {unread.length > 0 && (
                  <span className="text-[9px] bg-white text-black px-2 py-0.5 rounded font-mono font-bold uppercase">
                    {unread.length} NEW
                  </span>
                )}
              </div>

              {unread.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <Check className="w-5 h-5 text-white" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white">All Clear</span>
                  <span className="text-[11px] text-zinc-400">System telemetry is nominal</span>
                </div>
              ) : (
                <div className="divide-y divide-white/10 max-h-[300px] overflow-y-auto">
                  {unread.map((a) => (
                    <div key={a.id} className="p-3.5 hover:bg-white/5 transition">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white line-clamp-1">{a.title}</span>
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20 shrink-0">
                          {a.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{a.message}</p>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1.5 font-mono">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── User Profile & User Settings Menu (Signature Outer UI Styling) ── */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-3 py-1 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 transition shadow-sm group cursor-pointer"
            title="User Profile & Settings"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-black font-mono font-bold text-xs shrink-0 transition group-hover:scale-105">
              {userName[0]?.toUpperCase() || "U"}
            </span>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                {userName}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 leading-none mt-0.5">
                {userRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-72 rounded-[20px] border border-white/10 bg-zinc-950 shadow-2xl p-2.5 z-50 animate-in slide-in-from-top-2 fade-in duration-150">
              {/* User Identity Header */}
              <div className="p-3 pb-3.5 border-b border-white/10 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black font-mono font-bold text-sm shrink-0">
                  {userName[0]?.toUpperCase() || "U"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{userName}</div>
                  <div className="text-[11px] text-zinc-400 truncate font-mono">{userEmail}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-[5px] bg-white text-black">
                      {userRole}
                    </span>
                    <span className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-[5px] border border-white/20 bg-white/5 text-zinc-300">
                      {userPlan}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation & Settings Links */}
              <div className="py-2 space-y-0.5 text-xs font-medium">
                <Link
                  href="/settings/account"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition"
                >
                  <User className="w-3.5 h-3.5 shrink-0 stroke-[1.5] text-white" />
                  <span>User Profile & Account</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition"
                >
                  <Settings className="w-3.5 h-3.5 shrink-0 stroke-[1.5] text-white" />
                  <span>User Settings & Preferences</span>
                </Link>

                <Link
                  href="/settings/organization"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0 stroke-[1.5] text-white" />
                  <span>Organization Settings</span>
                </Link>

                {projectId && (
                  <Link
                    href={`/dashboard/${projectId}/settings`}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition"
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0 stroke-[1.5] text-zinc-400" />
                    <span className="truncate">Project Settings ({projectName})</span>
                  </Link>
                )}

                <Link
                  href="/settings/organization/api-keys"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition"
                >
                  <Key className="w-3.5 h-3.5 shrink-0 stroke-[1.5] text-white" />
                  <span>API Keys & Credentials</span>
                </Link>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition text-left"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
