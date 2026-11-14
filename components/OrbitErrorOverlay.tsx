"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Bug, ChevronDown, ExternalLink, X } from "lucide-react";

export interface OrbitErrorItem {
  id: string;
  message: string;
  type?: string;
  stack?: string;
  url?: string;
  release?: string;
  environment?: Record<string, unknown>;
  timestamp: string;
}

export interface OrbitErrorOverlayProps {
  errors: OrbitErrorItem[];
  onDismiss?: (id: string) => void;
  onDisable?: () => void;
  onReport?: (error: OrbitErrorItem) => void;
  position?: "bottom-right" | "top-right" | "bottom-left";
}

const positionClasses: Record<NonNullable<OrbitErrorOverlayProps["position"]>, string> = {
  "bottom-right": "bottom-4 right-4",
  "top-right": "right-4 top-4",
  "bottom-left": "bottom-4 left-4",
};

function formatEnvironment(environment?: Record<string, unknown>): string {
  if (!environment) return "Unknown runtime";
  const browser = typeof environment.browser === "string" ? environment.browser : null;
  const os = typeof environment.os === "string" ? environment.os : null;
  return [browser, os].filter(Boolean).join(" on ") || "Captured runtime";
}

export function OrbitErrorOverlay({
  errors,
  onDismiss,
  onDisable,
  onReport,
  position = "bottom-right",
}: OrbitErrorOverlayProps): JSX.Element | null {
  const [expanded, setExpanded] = useState(true);
  const visibleErrors = useMemo(() => errors.slice(0, 5), [errors]);

  if (visibleErrors.length === 0) return null;

  const latest = visibleErrors[0];

  return (
    <aside
      className={`fixed z-[100] w-[min(420px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/20 bg-black/95 text-white shadow-2xl backdrop-blur-xl ${positionClasses[position]}`}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between border-b border-white/10 p-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-black font-bold">
            <Bug className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs font-mono font-semibold uppercase tracking-wider">Exception Captured</span>
            <span className="block max-w-[280px] truncate text-xs text-zinc-400 font-mono">{latest.message}</span>
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded ? (
        <div className="max-h-[420px] overflow-y-auto p-4 space-y-3 font-mono">
          <div className="rounded-xl border border-white/15 bg-zinc-900 p-3.5 space-y-1">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-white" />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{latest.type ?? "Unhandled error"}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300 font-sans">{latest.message}</p>
                <p className="mt-2 text-[10px] text-zinc-500">
                  {formatEnvironment(latest.environment)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {visibleErrors.map((error) => (
              <div key={error.id} className="rounded-xl border border-white/10 bg-zinc-950 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">{error.message}</p>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      {new Date(error.timestamp).toLocaleTimeString()} {error.release ? `- ${error.release}` : ""}
                    </p>
                  </div>
                  {onDismiss ? (
                    <button
                      type="button"
                      onClick={() => onDismiss(error.id)}
                      className="rounded p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                      aria-label="Dismiss error"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex gap-2">
            {onReport ? (
              <button
                type="button"
                onClick={() => onReport(latest)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
              >
                Inspect Issue
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            ) : null}
            {onDisable ? (
              <button
                type="button"
                onClick={onDisable}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Dismiss
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
