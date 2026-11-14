"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  Search, 
  ShieldAlert
} from "lucide-react";
import { api } from "@/lib/api";

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Engineer" | "Viewer";
  twoFactor: boolean;
  status: "Active" | "Pending";
  joinedAt: string;
}

export default function OrganizationMembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Engineer" | "Viewer">("Engineer");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me()
      .then((user) => {
        if (user) {
          setMembers([
            {
              id: "mem_owner",
              name: user.name || "Owner",
              email: user.email || "admin@orbit.dev",
              role: "Owner",
              twoFactor: true,
              status: "Active",
              joinedAt: "Account Creation",
            },
          ]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes("@")) return;

    const newMember: MemberItem = {
      id: `mem_${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      twoFactor: false,
      status: "Pending",
      joinedAt: "Invited today",
    };

    setMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    setShowInviteModal(false);
    setNotice(`Invitation sent to ${newMember.email}.`);
    setTimeout(() => setNotice(""), 3500);
  };

  const handleRoleChange = (id: string, newRole: MemberItem["role"]) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
    setNotice("Member permissions updated.");
    setTimeout(() => setNotice(""), 3500);
  };

  const handleRemoveMember = (id: string, name: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setNotice(`Removed ${name} from organization.`);
    setTimeout(() => setNotice(""), 3500);
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Organization Members</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage teammates with access to your telemetry datasets, incident boards, and diagnostic logs.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Member</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-xs text-white flex items-center gap-2 font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter members by name or email address..."
          className="bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none w-full font-mono"
        />
      </div>

      {/* Members Table */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black text-zinc-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Security (2FA)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Joined</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 text-xs animate-pulse">
                    Loading organization members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 text-xs">
                    No members match search criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                          {member.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-white font-sans">{member.name}</div>
                          <div className="text-[11px] text-zinc-400">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {member.role === "Owner" ? (
                        <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold uppercase">
                          Owner
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                          className="bg-black border border-white/20 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Engineer">Engineer</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {member.twoFactor ? (
                        <span className="text-[10px] text-white flex items-center gap-1 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                          Enabled
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">
                          Disabled
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                          member.status === "Active"
                            ? "bg-white/10 text-white border-white/20"
                            : "bg-zinc-900 text-zinc-400 border-white/10"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {member.joinedAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {member.role !== "Owner" && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in text-white">
            <h3 className="text-lg font-bold text-white mb-1">Invite Teammate</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter email address and assign an organizational permission role.
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3 py-2 text-xs text-white outline-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">Permission Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Engineer">Engineer (Inspect stack traces, write alerts)</option>
                  <option value="Admin">Admin (Full project & cluster configuration)</option>
                  <option value="Viewer">Viewer (Read-only monitoring access)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-white hover:bg-zinc-200 text-black rounded-lg font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
