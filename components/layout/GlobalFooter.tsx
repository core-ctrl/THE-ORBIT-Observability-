import Link from "next/link";
import { Radar } from "lucide-react";

export function GlobalFooter() {
  return (
    <footer className="mt-auto py-6 px-6 text-xs text-zinc-500 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 border-t border-white/10">
      <div className="flex items-center gap-2 lg:mr-4 mb-2 lg:mb-0">
        <Radar className="h-4 w-4 text-zinc-400" strokeWidth={2} />
        <span>&copy; {new Date().getFullYear()} Core-Ctrl, Inc.</span>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
        <Link href="/legal/security" className="hover:text-white transition-colors">Security</Link>
        <Link href="/status" className="hover:text-white transition-colors">Status</Link>
        <Link href="https://github.com/core-ctrl/Orbit/issues" className="hover:text-white transition-colors">Community</Link>
        <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        <Link href="mailto:support@core-ctrl.com" className="hover:text-white transition-colors">Contact</Link>
        <button className="hover:text-white transition-colors cursor-pointer">Manage cookies</button>
        <button className="hover:text-white transition-colors cursor-pointer">Do not share my personal information</button>
      </div>
    </footer>
  );
}
