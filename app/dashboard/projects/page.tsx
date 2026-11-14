"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function DashboardProjectsRedirect() {
  const router = useRouter();

  useEffect(() => {
    const resolve = async () => {
      try {
        let projects = await api.projects();
        if (!projects || projects.length === 0) {
          const orgs = await api.organizations();
          if (orgs.length > 0) {
            projects = await api.projects(orgs[0].id);
          }
        }

        if (projects && projects.length > 0) {
          router.replace(`/dashboard/${projects[0].id}/projects`);
          return;
        }

        router.replace("/onboarding");
      } catch {
        router.replace("/login");
      }
    };
    resolve();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b0d]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-xs text-zinc-400">Loading projects...</span>
      </div>
    </div>
  );
}
