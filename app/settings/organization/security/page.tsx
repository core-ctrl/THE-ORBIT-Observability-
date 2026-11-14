"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Globe, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  FileLock2, 
  EyeOff 
} from "lucide-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

export default function OrganizationSecurityPage() {
  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [retentionDays, setRetentionDays] = useState("90");
  const [piiScrubbing, setPiiScrubbing] = useState(true);

  const [ipEnforced, setIpEnforced] = useState(false);
  const [ipList, setIpList] = useState<string[]>([]);
  const [newCidr, setNewCidr] = useState("");
  const [showAddCidr, setShowAddCidr] = useState(false);

  const [savedNotice, setSavedNotice] = useState("");

  const handleAddCidr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCidr.trim()) return;
    setIpList((prev) => [...prev, newCidr.trim()]);
    setNewCidr("");
    setShowAddCidr(false);
  };

  const handleRemoveCidr = (cidr: string) => {
    setIpList((prev) => prev.filter((item) => item !== cidr));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice("Organization security policies updated successfully.");
    setTimeout(() => setSavedNotice(""), 3500);
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security & Compliance Policies</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Enforce enterprise governance, mandatory multi-factor authentication, and IP network restrictions.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Authentication Governance */}
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Authentication Enforcement</h2>
              <p className="text-xs text-zinc-400">Strict login rules mandated across all organization accounts.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div>
                <div className="text-sm font-medium text-white">Require Two-Factor Authentication (2FA)</div>
                <div className="text-xs text-zinc-400">Mandate that all team members activate TOTP authentication.</div>
              </div>
              <ToggleSwitch
                checked={require2FA}
                onChange={setRequire2FA}
                ariaLabel="Require 2FA Toggle"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-white">Session Inactivity Timeout</div>
                <div className="text-xs text-zinc-400">Automatically disconnect idle browser sessions.</div>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="bg-black border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none font-mono cursor-pointer"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="480">8 Hours</option>
              </select>
            </div>
          </div>
        </section>

        {/* Data Privacy & Scrubbing */}
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Privacy & PII Scrubbing</h2>
              <p className="text-xs text-zinc-400">Automated sanitization before telemetry is written to storage.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div>
                <div className="text-sm font-medium text-white">Automated PII Masking</div>
                <div className="text-xs text-zinc-400">Strip passwords, tokens, API keys, and credit cards from stack traces.</div>
              </div>
              <ToggleSwitch
                checked={piiScrubbing}
                onChange={setPiiScrubbing}
                ariaLabel="PII Scrubbing Toggle"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-white">Telemetry Retention Window</div>
                <div className="text-xs text-zinc-400">Retention period before historical raw logs are purged.</div>
              </div>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="bg-black border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none font-mono cursor-pointer"
              >
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days (Enterprise Standard)</option>
                <option value="365">365 Days (Compliance Vault)</option>
              </select>
            </div>
          </div>
        </section>

        {/* IP Access List */}
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">IP Network Restrictions</h2>
                <p className="text-xs text-zinc-400">Restrict access to specific corporate CIDRs and VPN ranges.</p>
              </div>
            </div>

            <ToggleSwitch
              checked={ipEnforced}
              onChange={setIpEnforced}
              ariaLabel="IP Network Enforcement Toggle"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-white/10">
            {ipList.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500 font-mono">
                No IP CIDRs configured. All networks are currently permitted.
              </div>
            ) : (
              ipList.map((cidr) => (
                <div key={cidr} className="flex items-center justify-between p-2.5 bg-black border border-white/10 rounded-lg text-xs font-mono">
                  <span className="text-white">{cidr}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCidr(cidr)}
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}

            {showAddCidr ? (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newCidr}
                  onChange={(e) => setNewCidr(e.target.value)}
                  placeholder="e.g. 192.168.1.0/24 (Office Gateway)"
                  className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCidr}
                  className="px-3 py-1.5 bg-white text-black font-mono font-bold text-xs uppercase rounded-lg cursor-pointer"
                >
                  Add CIDR
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCidr(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddCidr(true)}
                className="mt-2 text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Allowed CIDR Block</span>
              </button>
            )}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Save Security Policies
          </button>
        </div>
      </form>
    </div>
  );
}
