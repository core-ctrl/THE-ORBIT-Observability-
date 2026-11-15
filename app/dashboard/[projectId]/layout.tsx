"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useSocket } from "@/hooks/useSocket";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { GuardianChatSidebar } from "@/components/layout/GuardianChatSidebar";
import { getToken, clearToken } from "@/lib/api";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Enforce tab/window session lifecycle: closing tab ends session
  useEffect(() => {
    if (!getToken()) {
      clearToken();
      router.replace("/login");
    }
  }, [router]);

  // Auto logout on 15 minutes of inactivity
  useIdleTimer(15 * 60 * 1000);

  // Called once at layout level — singleton socket persists across all page navigations
  useSocket();

  return (
    <div 
      className="monochrome-shell flex min-h-screen text-[var(--text-primary)] relative selection:bg-white selection:text-black transition-colors duration-300 bg-black"
    >
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[240px] flex flex-col min-h-screen relative z-10 bg-black transition-all duration-300 w-full min-w-0 overflow-x-hidden">
        <TopBar />
        <main className="flex-1 p-3 sm:p-5 md:p-6 flex flex-col max-w-[1600px] w-full mx-auto min-w-0">
          {children}
        </main>
        <GlobalFooter />
      </div>
      <GuardianChatSidebar />
    </div>
  );
}
