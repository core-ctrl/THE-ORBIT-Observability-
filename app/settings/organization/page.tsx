"use client";

import { useState, useEffect, useCallback } from "react";
import { Globe, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function OrganizationSettingsPage() {
  const [orgId, setOrgId] = useState("");
  const [loading, setLoading] = useState(true);

  // Status Page states
  const [statusTitle, setStatusTitle] = useState("");
  const [statusSlug, setStatusSlug] = useState("");
  const [isPublicPage, setIsPublicPage] = useState(true);
  const [saveStatusPageMsg, setSaveStatusPageMsg] = useState("");

  const fetchStatusPageConfig = useCallback(async (id: string) => {
    try {
      const data = await api.statusPageConfig(id);
      setStatusTitle(data?.title || "Orbit Operational Status");
      setStatusSlug(data?.slug || "orbit-status");
      setIsPublicPage(data?.is_public ?? true);
    } catch {
      setStatusTitle("Orbit Operational Status");
      setStatusSlug("orbit-status");
      setIsPublicPage(true);
    }
  }, []);

  useEffect(() => {
    api.organizations()
      .then((orgs) => {
        if (orgs && orgs.length > 0) {
          const id = orgs[0].id;
          setOrgId(id);
          fetchStatusPageConfig(id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchStatusPageConfig]);

  const handleSaveStatusPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setSaveStatusPageMsg("saving");
    try {
      await api.updateStatusPage(orgId, {
        title: statusTitle,
        slug: statusSlug,
        is_public: isPublicPage
      });
      setSaveStatusPageMsg("success");
      setTimeout(() => setSaveStatusPageMsg(""), 3000);
    } catch {
      setSaveStatusPageMsg("error");
      setTimeout(() => setSaveStatusPageMsg(""), 3000);
    }
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Organization Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage organization-wide configurations, team defaults, and public operational status pages.
        </p>
      </div>

      <div className="space-y-6">
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5 text-white" />
            <span>Publish Status Page</span>
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Create a public operational status website for customers to review ongoing incidents and component latency measurements.
          </p>
          
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Loading configuration...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveStatusPage} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                  Status Page Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Orbit Production Status"
                  value={statusTitle}
                  onChange={(e) => setStatusTitle(e.target.value)}
                  className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                  Status Page Slug Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. orbit-health"
                  value={statusSlug}
                  onChange={(e) => setStatusSlug(e.target.value)}
                  className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white font-mono outline-none transition"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={isPublicPage}
                  onChange={(e) => setIsPublicPage(e.target.checked)}
                  className="rounded bg-black border-white/30 text-white focus:ring-0 cursor-pointer"
                />
                <label htmlFor="is_public" className="text-xs text-zinc-300 cursor-pointer">
                  Allow public view (Available anonymously at /status/{statusSlug || "slug"})
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save Configuration
                </button>
                {saveStatusPageMsg === "saving" && (
                  <span className="text-xs text-zinc-400 font-mono animate-pulse">Saving...</span>
                )}
                {saveStatusPageMsg === "success" && (
                  <span className="text-xs text-white font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Saved successfully!
                  </span>
                )}
                {saveStatusPageMsg === "error" && (
                  <span className="text-xs text-white font-mono flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-white" />
                    Error saving config.
                  </span>
                )}
              </div>
            </form>
          )}
        </section>

        {!loading && statusSlug && (
          <section className="bg-zinc-950 border border-white/10 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Developer Embeds
            </h3>
            
            <div>
              <span className="text-xs font-bold text-white block mb-1">Public Page URL</span>
              <a 
                href={`/status/${statusSlug}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-zinc-300 hover:text-white underline font-mono break-all"
              >
                {typeof window !== 'undefined' ? window.location.origin : ''}/status/{statusSlug}
              </a>
            </div>

            <div>
              <span className="text-xs font-bold text-white block mb-1">GitHub README Status Badge</span>
              <p className="text-[11px] text-zinc-400 mb-2">Embed this SVG markdown inside project README files for live status checking:</p>
              <div className="font-mono text-xs bg-black border border-white/20 p-3 rounded-lg text-white break-all select-all">
                {`[![Orbit Status](${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/projects/YOUR_PROJECT_ID/badge.svg)](${typeof window !== 'undefined' ? window.location.origin : ''}/status/${statusSlug})`}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
