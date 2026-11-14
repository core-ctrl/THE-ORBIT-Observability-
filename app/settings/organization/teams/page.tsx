"use client";

import { useState } from "react";
import { 
  Users, 
  Plus, 
  FolderKanban, 
  ShieldCheck, 
  MoreVertical, 
  Trash2, 
  CheckCircle2,
  Search,
  UserPlus
} from "lucide-react";

interface TeamItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  membersCount: number;
  projectsCount: number;
  role: "Admin" | "Maintainer" | "Developer" | "Viewer";
  lead: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newTeamRole, setNewTeamRole] = useState<"Admin" | "Maintainer" | "Developer" | "Viewer">("Developer");
  const [notice, setNotice] = useState("");

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const created: TeamItem = {
      id: `team_${Date.now()}`,
      name: newTeamName.trim(),
      slug: newTeamName.toLowerCase().replace(/\s+/g, "-"),
      description: newTeamDesc.trim() || "No team description provided.",
      membersCount: 1,
      projectsCount: 1,
      role: newTeamRole,
      lead: "You",
    };

    setTeams((prev) => [...prev, created]);
    setNewTeamName("");
    setNewTeamDesc("");
    setShowCreateModal(false);
    setNotice(`Team "${created.name}" created successfully.`);
    setTimeout(() => setNotice(""), 3500);
  };

  const handleDeleteTeam = (id: string, name: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setNotice(`Team "${name}" removed.`);
    setTimeout(() => setNotice(""), 3500);
  };

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Teams & Permissions</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Organize organization members into specialized teams with dedicated role-based project permissions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Team</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-xs text-white flex items-center gap-2 font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter / Search */}
      <div className="flex items-center gap-3 bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter teams by name or description..."
          className="bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none w-full font-mono"
        />
      </div>

      {/* Team Cards Grid or Empty State */}
      {filteredTeams.length === 0 ? (
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-10 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-white">No teams created yet</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Create functional engineering teams to group developers, manage access policies, and route incident notifications.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Team</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-zinc-950 border border-white/10 rounded-xl p-5 shadow-sm hover:border-white/20 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{team.name}</h3>
                    <span className="text-[11px] font-mono text-zinc-400">@{team.slug}</span>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                    {team.role}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 mb-4">
                  {team.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-white" />
                    <span>{team.membersCount} member{team.membersCount !== 1 ? "s" : ""}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderKanban className="w-3.5 h-3.5 text-white" />
                    <span>{team.projectsCount} project{team.projectsCount !== 1 ? "s" : ""}</span>
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteTeam(team.id, team.name)}
                  className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                  title="Delete team"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in text-white">
            <h3 className="text-lg font-bold text-white mb-1">Create Organization Team</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Teams inherit project access rules and are notified collectively on incidents.
            </p>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">Team Name</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Core SRE Squad"
                  className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3 py-2 text-xs text-white outline-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Briefly describe this team's operational scope..."
                  className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3 py-2 text-xs text-white outline-none resize-none h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">Default Permission Role</label>
                <select
                  value={newTeamRole}
                  onChange={(e) => setNewTeamRole(e.target.value as any)}
                  className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Developer">Developer (View metrics, resolve issues)</option>
                  <option value="Maintainer">Maintainer (Manage project config, integrations)</option>
                  <option value="Admin">Admin (Full administrative & billing control)</option>
                  <option value="Viewer">Viewer (Read-only observability access)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-white hover:bg-zinc-200 text-black rounded-lg font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
