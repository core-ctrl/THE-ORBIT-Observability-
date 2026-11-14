"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Building, Clock, Check, Upload, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AccountSettingsPage() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("ADMIN");
  const [userOrg, setUserOrg] = useState("Default Organization");
  const [userTimezone, setUserTimezone] = useState("UTC (GMT+00:00)");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.me()
      .then((user) => {
        if (user) {
          setUserName(user.name || "Administrator");
          setUserEmail(user.email || "admin@orbit.dev");
          setUserRole(user.role || "ADMIN");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    api.organizations()
      .then((orgs) => {
        if (orgs && orgs.length > 0) {
          setUserOrg(orgs[0].name || "Production Org");
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Simulate/call update profile
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Account Details</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage your personal identity, avatar, contact credentials, and session preferences.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 bg-zinc-900/60 rounded-xl border border-white/10" />
          <div className="h-64 bg-zinc-900/60 rounded-xl border border-white/10" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Avatar & Identity Snapshot */}
          <div className="bg-zinc-950 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-black font-mono font-bold text-2xl flex items-center justify-center border border-white/20 shadow-md">
                {userName[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{userName}</h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{userEmail}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white text-black">
                    {userRole}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/20">
                    {userOrg}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Avatar</span>
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors"
                title="Remove Avatar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Personal Information Form */}
          <form onSubmit={handleSave} className="bg-zinc-950 border border-white/10 rounded-xl p-6 space-y-6">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-white" />
              <span>Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-zinc-400 outline-none cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-mono text-zinc-500 uppercase">
                    Primary
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Primary email used for security notifications and MFA verification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Timezone
                </label>
                <select
                  value={userTimezone}
                  onChange={(e) => setUserTimezone(e.target.value)}
                  className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white outline-none transition cursor-pointer"
                >
                  <option value="UTC (GMT+00:00)">UTC (GMT+00:00) Universal Standard</option>
                  <option value="America/New_York (EST)">America/New_York (EST / EDT)</option>
                  <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST / PDT)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT / BST)</option>
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST +05:30)</option>
                  <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST +09:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Organization Membership
                </label>
                <div className="w-full bg-zinc-900/60 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-zinc-400">
                  {userOrg}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="submit"
                disabled={saving}
                className="bg-white hover:bg-zinc-200 text-black px-5 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-white font-mono">
                  <Check className="w-4 h-4 text-white" />
                  <span>Profile updated successfully</span>
                </div>
              )}
            </div>
          </form>

          {/* Security & Activity Overview */}
          <div className="bg-zinc-950 border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-white" />
              <span>Active Security Snapshot</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-black border border-white/10">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Two-Factor Auth</span>
                <div className="text-sm font-bold text-white mt-1">Enabled (TOTP)</div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Protected with authenticator app</p>
              </div>

              <div className="p-4 rounded-lg bg-black border border-white/10">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Current Session</span>
                <div className="text-sm font-bold text-white mt-1">Active Now</div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Chrome on Windows (Localhost)</p>
              </div>

              <div className="p-4 rounded-lg bg-black border border-white/10">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Account Access</span>
                <div className="text-sm font-bold text-white mt-1">Password & Keys</div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Last password update: 14 days ago</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
