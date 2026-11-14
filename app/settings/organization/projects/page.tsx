"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Settings2, FolderKanban } from "lucide-react";
import { api } from "@/lib/api";
import type { Project } from "@/types/orbit";

export default function ProjectsSettingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.organizations()
      .then((orgs) => {
        if (orgs && orgs.length > 0) {
          return api.projects(orgs[0].id);
        }
        return [];
      })
      .then((data) => setProjects(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl space-y-8 animate-fade-in text-white">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage and configure all projects within this organization.</p>
        </div>
        <Link 
          href="/onboarding" 
          className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Project</span>
        </Link>
      </div>

      <div className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="p-8 text-center text-zinc-400 text-xs font-mono animate-pulse">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-white">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-white">No projects found</h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Create a project to start capturing runtime traces, performance metrics, and logs.
              </p>
              <div className="pt-2">
                <Link
                  href="/onboarding"
                  className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Project</span>
                </Link>
              </div>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold bg-white text-black shadow-sm shrink-0">
                    {project.name[0]?.toUpperCase() || "O"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <div className="flex gap-2 text-xs text-zinc-400 mt-1 font-mono">
                      <span>Platform: <span className="capitalize text-zinc-200">{project.platform}</span></span>
                      <span>·</span>
                      <span>Environment: <span className="capitalize text-zinc-200">{project.environment}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/dashboard/${project.id}/issues`} 
                    className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 font-mono transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href={`/settings/organization/projects/${project.id}`} 
                    className="text-xs bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 font-mono transition-colors flex items-center gap-1"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Settings
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
