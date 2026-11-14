"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Laptop, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [sessions, setSessions] = useState([
    {
      id: "sess_1",
      device: "Windows 11 (Chrome 128)",
      ip: "127.0.0.1",
      location: "Localhost",
      lastActive: "Active now",
      isCurrent: true,
    },
  ]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordError("");
    setPasswordStatus("saving");
    setTimeout(() => {
      setPasswordStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus("idle"), 3500);
    }, 800);
  };

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRevokeAllOthers = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText("JBSWY3DPEHPK3PXP");
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setVerificationCode("");
    }
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Security Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Control your authentication credentials, multi-factor security, and active sessions.
        </p>
      </div>

      {/* Password Management */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Change Password</h2>
            <p className="text-xs text-zinc-400">Ensure your account uses a long, unique password.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          {passwordError && (
            <div className="p-3 bg-white/5 border border-white/20 rounded-lg text-xs text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordStatus === "success" && (
            <div className="p-3 bg-white/10 border border-white/30 rounded-lg text-xs text-white flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Your password has been updated successfully.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={passwordStatus === "saving"}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {passwordStatus === "saving" ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>

      {/* Two-Factor Authentication (2FA) */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Two-Factor Authentication (2FA)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Add an additional layer of security using an authenticator app (Google Authenticator, 1Password, Authy).
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-full border ${
              twoFactorEnabled
                ? "bg-white text-black border-white"
                : "bg-zinc-900 text-zinc-400 border-white/10"
            }`}
          >
            {twoFactorEnabled ? "Active" : "Disabled"}
          </span>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">
              {twoFactorEnabled ? "Two-factor authentication is protecting your account" : "Authenticator App"}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {twoFactorEnabled
                ? "Codes will be required on each new device login."
                : "Generate one-time time-based passwords (TOTP)."}
            </p>
          </div>

          {twoFactorEnabled ? (
            <button
              onClick={() => setTwoFactorEnabled(false)}
              className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white border border-white/20 hover:bg-white/10 rounded-lg font-mono transition-colors cursor-pointer"
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={() => setShow2FAModal(true)}
              className="px-3.5 py-1.5 text-xs bg-white hover:bg-zinc-200 text-black rounded-lg font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              Enable 2FA
            </button>
          )}
        </div>
      </section>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in text-white">
            <h3 className="text-lg font-bold text-white mb-2">Set Up Authenticator App</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Scan this QR code with your authenticator app (e.g. Google Authenticator, 1Password) or enter the secret manually.
            </p>

            <div className="bg-white p-4 rounded-xl w-44 h-44 mx-auto flex items-center justify-center mb-4">
              <QrCode className="w-36 h-36 text-black" />
            </div>

            <div className="bg-black border border-white/20 p-2.5 rounded-lg flex items-center justify-between mb-4">
              <code className="text-xs text-white font-mono">JBSWY3DPEHPK3PXP</code>
              <button
                type="button"
                onClick={handleCopySecret}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSecret ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                  Enter 6-digit confirmation code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest text-white outline-none focus:border-white"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verificationCode.length !== 6}
                  className="px-4 py-1.5 text-xs bg-white hover:bg-zinc-200 text-black rounded-lg font-bold font-mono uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Verify & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Active Sessions</h2>
              <p className="text-xs text-zinc-400">Devices currently authenticated to your account.</p>
            </div>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllOthers}
              className="text-xs text-zinc-400 hover:text-white font-mono transition-colors"
            >
              Log Out Other Sessions
            </button>
          )}
        </div>

        <div className="divide-y divide-white/10">
          {sessions.map((sess) => (
            <div key={sess.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-zinc-400">
                  {sess.device.includes("Ubuntu") ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    {sess.device}
                    {sess.isCurrent && (
                      <span className="text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20 px-1.5 py-0.2 rounded">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {sess.ip} • {sess.location} • {sess.lastActive}
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(sess.id)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  title="Revoke session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
