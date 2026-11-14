"use client";

import { useState } from "react";
import { 
  Fingerprint, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";

interface IdentityItem {
  id: string;
  name: string;
  identifier: string | null;
  status: "connected" | "disconnected";
  connectedAt: string | null;
}

export default function IdentitiesPage() {
  const [identities, setIdentities] = useState<IdentityItem[]>([
    {
      id: "google",
      name: "Google Workspace",
      identifier: null,
      status: "disconnected",
      connectedAt: null,
    },
    {
      id: "github",
      name: "GitHub Enterprise",
      identifier: null,
      status: "disconnected",
      connectedAt: null,
    },
    {
      id: "microsoft",
      name: "Microsoft Entra ID (Azure AD)",
      identifier: null,
      status: "disconnected",
      connectedAt: null,
    },
    {
      id: "gitlab",
      name: "GitLab Cloud / Self-Managed",
      identifier: null,
      status: "disconnected",
      connectedAt: null,
    },
  ]);

  const [notice, setNotice] = useState("");

  const handleToggle = (id: string, name: string, currentStatus: string) => {
    if (currentStatus === "connected") {
      setIdentities((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "disconnected", identifier: null, connectedAt: null } : i
        )
      );
      setNotice(`Disconnected from ${name}.`);
    } else {
      setIdentities((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "connected",
                identifier: `connected_user@${id}.auth`,
                connectedAt: "Just now",
              }
            : i
        )
      );
      setNotice(`Connected to ${name} SSO.`);
    }
    setTimeout(() => setNotice(""), 3500);
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Connected Identities</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Link single sign-on (SSO) providers and federated OAuth accounts for passwordless authentication.
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-xs text-white flex items-center gap-2 font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{notice}</span>
        </div>
      )}

      {/* Identity Providers List */}
      <div className="bg-zinc-950 border border-white/10 rounded-xl divide-y divide-white/10 shadow-sm">
        {identities.map((item) => {
          const isConnected = item.status === "connected";

          return (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 sm:mt-0">
                  <Fingerprint className="w-5 h-5 text-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{item.name}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                        isConnected
                          ? "bg-white text-black"
                          : "bg-zinc-900 text-zinc-400 border border-white/10"
                      }`}
                    >
                      {isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 mt-1 font-mono">
                    {isConnected ? (
                      <span>Identifier: {item.identifier} &bull; Linked: {item.connectedAt}</span>
                    ) : (
                      <span>No active identity mapping. Connect to enable One-Click SSO.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleToggle(item.id, item.name, item.status)}
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    isConnected
                      ? "text-zinc-400 hover:text-white border border-white/10 hover:border-white/30"
                      : "bg-white hover:bg-zinc-200 text-black"
                  }`}
                >
                  {isConnected ? "Disconnect" : "Connect Provider"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
