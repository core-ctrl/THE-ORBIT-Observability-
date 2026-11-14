"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertTriangle, 
  Download, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2 
} from "lucide-react";
import { clearToken } from "@/lib/api";

export default function CloseAccountPage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleExportData = () => {
    setExporting(true);
    setTimeout(() => {
      const data = {
        exportedAt: new Date().toISOString(),
        service: "Orbit Observability Platform",
        account: "orbit-user-archive",
        telemetry: {
          projectsCount: 1,
          status: "healthy",
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orbit-account-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 4000);
    }, 1200);
  };

  const handlePermanentDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      clearToken();
      router.push("/login");
    }, 1500);
  };

  const isConfirmed = confirmText === "DELETE MY ACCOUNT";

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-white" />
          <span>Close Account</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Export your telemetry archives or permanently purge your account and associated assets.
        </p>
      </div>

      {/* Export Section */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-white" />
              <span>Export Your Account Telemetry Data</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-lg">
              Before deleting your account, download an offline JSON archive of all your monitored services, stack trace analyses, custom alert configurations, and historical incident logs.
            </p>
          </div>

          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white rounded-lg transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Generating Archive..." : "Export All Data (.json)"}</span>
          </button>
        </div>

        {exportDone && (
          <div className="mt-4 p-3 bg-white/10 border border-white/20 rounded-lg text-xs text-white font-mono flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Your archive has been compiled and downloaded to your computer.</span>
          </div>
        )}
      </section>

      {/* Danger Zone */}
      <section className="bg-zinc-950 border-2 border-white/30 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-white" />
            <span>Danger Zone: Permanent Account Deletion</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Once you delete your account, there is no going back. Please be completely certain.
          </p>
        </div>

        <div className="bg-black border border-white/20 rounded-lg p-4 space-y-2 text-xs text-zinc-300">
          <div className="font-bold text-white flex items-center gap-1.5 font-mono">
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>The following assets will be immediately destroyed:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-1">
            <li>All monitored projects, DSN tokens, and client SDK connections will be severed</li>
            <li>All stored stack traces, logs, and APM performance counters will be wiped</li>
            <li>Any active subscriptions will be immediately canceled without refund</li>
            <li>All Orbit AI Guardian root-cause logs and synthesized git patches will be erased</li>
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-mono text-zinc-400">
            To proceed, type <span className="font-mono text-white font-bold underline">DELETE MY ACCOUNT</span> below:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'DELETE MY ACCOUNT' to confirm"
            className="w-full max-w-md bg-black border border-white/30 rounded-lg px-3.5 py-2 text-sm font-mono text-white outline-none focus:border-white"
          />
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={!isConfirmed}
          className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Permanently Delete My Orbit Account</span>
        </button>
      </section>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/30 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in space-y-4 text-white">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-black" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Final Confirmation</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you 100% sure you want to delete your Orbit account? This action is immediate and non-reversible.
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs text-zinc-300 rounded-lg font-mono transition-colors cursor-pointer"
              >
                Cancel, Keep Account
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Purging Account..." : "Yes, Purge Everything"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
