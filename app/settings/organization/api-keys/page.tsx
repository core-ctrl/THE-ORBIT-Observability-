"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Check, Plus, Trash2, Copy } from "lucide-react";
import { api } from "@/lib/api";
import type { ApiKeyItem } from "@/types/orbit";

export default function ApiKeysPage() {
  const [orgId, setOrgId] = useState("");
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchApiKeys = useCallback(async (id: string) => {
    try {
      const data = await api.apiKeys(id);
      setApiKeys(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.organizations()
      .then((orgs) => {
        if (orgs && orgs.length > 0) {
          const id = orgs[0].id;
          setOrgId(id);
          fetchApiKeys(id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [fetchApiKeys]);

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newKeyName.trim()) return;
    try {
      const data = await api.createApiKey(orgId, newKeyName.trim());
      setNewlyCreatedKey(data.raw_key || data.key_prefix);
      setNewKeyName("");
      fetchApiKeys(orgId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!orgId) return;
    try {
      await api.revokeApiKey(orgId, keyId);
      fetchApiKeys(orgId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = () => {
    if (!newlyCreatedKey) return;
    navigator.clipboard.writeText(newlyCreatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl space-y-6 animate-fade-in text-white">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">API Keys</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage programmatic access tokens and ingestion credentials.</p>
      </div>

      <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Key className="w-5 h-5 text-white" />
          <span>Generate API Key</span>
        </h2>
        <p className="text-xs text-zinc-400 mb-4">
          Provision tokens to query Orbit's raw data programmatically or ingest telemetry via custom scrapers.
        </p>
        
        <form onSubmit={handleCreateApiKey} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
              Key Description Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. CI-deploy-pipeline"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none"
                required
              />
              <button 
                type="submit" 
                className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
              >
                Generate
              </button>
            </div>
          </div>
        </form>
      </section>

      {newlyCreatedKey && (
        <section className="bg-zinc-950 border border-white/30 rounded-xl p-5 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Check className="w-4 h-4 text-white" />
              API Key Generated Successfully
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey ? "Copied!" : "Copy Key"}</span>
            </button>
          </div>
          <p className="text-xs text-zinc-400">Copy this key now. It will not be shown again for security reasons:</p>
          <div className="font-mono text-xs bg-black border border-white/20 p-3 rounded-lg text-white break-all select-all">
            {newlyCreatedKey}
          </div>
        </section>
      )}

      <section className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/10 bg-black">
          <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">Active Workspace Keys</h3>
        </div>
        <div className="divide-y divide-white/10 font-mono">
          {loading ? (
            <p className="p-5 text-xs text-zinc-400 text-center animate-pulse">Loading API keys...</p>
          ) : apiKeys.length === 0 ? (
            <p className="p-8 text-xs text-zinc-500 text-center">No API keys generated yet.</p>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div>
                  <span className="font-semibold text-white text-xs font-sans">{key.name}</span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                    <span>Prefix: <code className="bg-black border border-white/10 px-1 py-0.5 rounded text-white">{key.key_prefix}</code></span>
                    <span>·</span>
                    <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeApiKey(key.id)}
                  className="text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 text-xs font-mono transition-colors cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
