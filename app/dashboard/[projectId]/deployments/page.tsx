"use client";

import { useEffect, useState, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { GitCommit, Calendar, Tag, User, Server } from "lucide-react";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { Deployment } from "@/types/orbit";

export default function DeploymentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const data = await api.deployments(projectId);
        setDeployments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDeployments();
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "failed":
        return "bg-zinc-800 text-zinc-300 border border-white/20";
      case "deploying":
        return "bg-zinc-700 text-white border border-white/30 animate-pulse";
      default:
        return "bg-white text-black border border-white font-semibold";
    }
  };

  if (loading) {
    return <ListSkeleton items={4} />;
  }

  return (
    <div className="space-y-6 max-w-4xl text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            CI/CD & Releases
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <GitCommit className="h-4 w-4" />
              </span>
              Deployments
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              {deployments.length} RECORDED
            </span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        {deployments.length === 0 ? (
          <EmptyState 
            icon={Server}
            title="No deployments recorded"
            description="Log deployments using the Orbit CLI, webhooks, or GitHub Actions integration."
          />
        ) : (
          <div className="relative border-l border-white/10 ml-3 pl-8 space-y-8">
            {deployments.map((dep) => (
              <div key={dep.id} className="relative">
                {/* Node Dot Icon */}
                <span className="absolute -left-[45px] top-1 w-8 h-8 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-white">
                  <GitCommit className="w-4 h-4" />
                </span>

                <div className="bg-black border border-white/10 hover:border-white/20 rounded-xl p-5 transition-colors space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-white">{dep.version}</span>
                      <Badge className={getStatusColor(dep.status)}>{dep.status}</Badge>
                      <span className="text-xs bg-zinc-900 border border-white/10 text-zinc-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                        <Tag className="w-3 h-3 text-zinc-500" /> {dep.environment}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {formatDistanceToNow(new Date(dep.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {dep.commit_message && (
                    <p className="text-sm font-medium text-white leading-relaxed">
                      {dep.commit_message}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap border-t border-white/10 pt-3 font-mono">
                    {dep.commit_sha && (
                      <span className="bg-zinc-900 px-2 py-1 rounded border border-white/10 text-zinc-300">
                        sha: {dep.commit_sha.substring(0, 7)}
                      </span>
                    )}
                    {dep.author_name && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-500" /> Released by {dep.author_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
