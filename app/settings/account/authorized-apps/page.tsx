"use client";

import { useState } from "react";
import { 
  AppWindow, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  Code2,
  Plus,
  Key
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface AuthorizedApp {
  id: string;
  name: string;
  developer: string;
  authorizedAt: string;
  permissions: string[];
  lastUsed: string;
}

export default function AuthorizedAppsPage() {
  const [apps, setApps] = useState<AuthorizedApp[]>([]);
  const [notice, setNotice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [appName, setAppName] = useState("");
  const [appDeveloper, setAppDeveloper] = useState("");

  const handleRevoke = (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    setNotice("Application authorization revoked.");
    setTimeout(() => setNotice(""), 3000);
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;

    const newApp: AuthorizedApp = {
      id: `app_${Date.now()}`,
      name: appName.trim(),
      developer: appDeveloper.trim() || "Internal Application",
      authorizedAt: "Just now",
      permissions: ["Telemetry Read", "Event Ingestion Stream"],
      lastUsed: "Just now"
    };

    setApps((prev) => [newApp, ...prev]);
    setAppName("");
    setAppDeveloper("");
    setShowModal(false);
    setNotice(`Authorized ${newApp.name} successfully.`);
    setTimeout(() => setNotice(""), 3000);
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Authorized Applications</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Third-party applications, IDE plugins, and bots with OAuth access to your Orbit account.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Authorize App</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-xs text-white flex items-center gap-2 font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{notice}</span>
        </div>
      )}

      {showModal && (
        <div className="bg-zinc-950 border border-white/20 rounded-xl p-5 shadow-2xl animate-scale-in">
          <h3 className="text-sm font-bold text-white mb-1">Authorize New OAuth Client / App</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Provide the application details or client credentials to authorize API scopes.
          </p>

          <form onSubmit={handleCreateApp} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                Application Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. VSCode Orbit Extension"
                className="w-full bg-black border border-white/20 rounded-lg px-3.5 py-2 text-sm text-white outline-none focus:border-white"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                Developer / Vendor
              </label>
              <input
                type="text"
                value={appDeveloper}
                onChange={(e) => setAppDeveloper(e.target.value)}
                placeholder="e.g. Core-Ctrl, Inc."
                className="w-full bg-black border border-white/20 rounded-lg px-3.5 py-2 text-sm text-white outline-none focus:border-white"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Authorize
              </button>
            </div>
          </form>
        </div>
      )}

      {apps.length === 0 ? (
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-10 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-white">
            <AppWindow className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-white">No authorized applications</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You haven't granted third-party access to your account. Authorize an application to enable developer integrations.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect First Application</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-zinc-950 border border-white/10 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{app.name}</h3>
                    <p className="text-xs text-zinc-400">{app.developer}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(app.id)}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 rounded-lg font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke</span>
                </button>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Granted Scopes</span>
                <div className="flex flex-wrap gap-1.5">
                  {app.permissions.map((perm) => (
                    <span key={perm} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-300">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-3">
                <span>Authorized: {app.authorizedAt}</span>
                <span>•</span>
                <span>Last Used: {app.lastUsed}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
