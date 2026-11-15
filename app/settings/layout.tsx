import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SettingsSidebar } from "@/components/layout/SettingsSidebar";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { OrbitLogo } from "@/components/ui/orbit-logo";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="monochrome-shell min-h-screen bg-black text-white flex transition-colors duration-300 selection:bg-white selection:text-black">
      <SettingsSidebar />
      <div className="flex-1 ml-0 md:ml-[240px] flex flex-col min-h-screen bg-black w-full min-w-0 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-white/10 bg-black sticky top-0 z-40">
          <OrbitLogo href="/dashboard" size="sm" />
          <Link 
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full">
          {children}
        </main>
        <GlobalFooter />
      </div>
    </div>
  );
}
