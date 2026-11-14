"use client";

import { useState, useEffect } from "react";
import { 
  Mail, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Star, 
  AlertCircle 
} from "lucide-react";
import { api } from "@/lib/api";

interface EmailRecord {
  id: string;
  email: string;
  isPrimary: boolean;
  isVerified: boolean;
  addedAt: string;
}

export default function EmailSettingsPage() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me()
      .then((user) => {
        if (user?.email) {
          setEmails([
            {
              id: "em_primary",
              email: user.email,
              isPrimary: true,
              isVerified: true,
              addedAt: "Account Creation",
            },
          ]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (emails.some((e) => e.email.toLowerCase() === newEmail.toLowerCase())) {
      setErrorMsg("This email is already associated with your account.");
      return;
    }

    const created: EmailRecord = {
      id: `em_${Date.now()}`,
      email: newEmail.trim().toLowerCase(),
      isPrimary: false,
      isVerified: false,
      addedAt: "Just now",
    };

    setEmails((prev) => [...prev, created]);
    setNewEmail("");
    setShowAddForm(false);
    setErrorMsg("");
    showNotice(`Verification link dispatched to ${created.email}`);
  };

  const handleMakePrimary = (id: string) => {
    setEmails((prev) =>
      prev.map((e) => ({
        ...e,
        isPrimary: e.id === id,
      }))
    );
    showNotice("Primary email address updated.");
  };

  const handleRemove = (id: string) => {
    const target = emails.find((e) => e.id === id);
    if (target?.isPrimary) {
      setErrorMsg("Cannot remove your primary account email.");
      return;
    }
    setEmails((prev) => prev.filter((e) => e.id !== id));
    showNotice("Email address removed.");
  };

  const handleResend = (email: string) => {
    showNotice(`Verification email resent to ${email}.`);
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(""), 3500);
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Email Addresses</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage email addresses linked to your Orbit identity for alerts, billing, and recovery.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Email</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-xs text-white flex items-center gap-2 font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{actionNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-white/5 border border-white/20 rounded-lg text-xs text-white flex items-center gap-2 font-mono animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Email Form Modal/Panel */}
      {showAddForm && (
        <div className="bg-zinc-950 border border-white/20 rounded-xl p-5 shadow-lg animate-scale-in">
          <h3 className="text-sm font-bold text-white mb-1">Add Alternate Email Address</h3>
          <p className="text-xs text-zinc-400 mb-3">
            We will send a verification link to confirm ownership of this inbox.
          </p>

          <form onSubmit={handleAddEmail} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="name@company.com"
                className="flex-1 bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white font-mono outline-none transition"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Send Verification
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setErrorMsg("");
                }}
                className="px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Email List */}
      <div className="bg-zinc-950 border border-white/10 rounded-xl divide-y divide-white/10 shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-6 bg-zinc-900 rounded w-1/2" />
            <div className="h-4 bg-zinc-900 rounded w-1/4" />
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs">
            No email addresses found. Please add an email.
          </div>
        ) : (
          emails.map((item) => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 sm:mt-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white font-mono">{item.email}</span>
                    {item.isPrimary && (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-white text-black">
                        Primary
                      </span>
                    )}
                    {item.isVerified ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/10 text-white border border-white/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900 text-zinc-400 border border-white/10 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 font-mono">
                    Added: {item.addedAt}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {!item.isVerified && (
                  <button
                    onClick={() => handleResend(item.email)}
                    className="px-2.5 py-1 text-xs text-zinc-300 hover:text-white border border-white/20 hover:bg-white/10 rounded-md font-mono transition-colors cursor-pointer"
                  >
                    Resend Link
                  </button>
                )}

                {!item.isPrimary && item.isVerified && (
                  <button
                    onClick={() => handleMakePrimary(item.id)}
                    className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 rounded-md font-mono transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3 h-3" />
                    <span>Make Primary</span>
                  </button>
                )}

                {!item.isPrimary && (
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                    title="Remove email"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
