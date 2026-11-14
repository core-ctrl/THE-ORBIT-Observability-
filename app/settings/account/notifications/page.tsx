"use client";

import { useState } from "react";
import { 
  Bell, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  RadioTower,
  Smartphone,
  Check
} from "lucide-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

export default function NotificationsSettingsPage() {
  const [preferences, setPreferences] = useState({
    criticalIncidents: true,
    warnings: true,
    resolvedIncidents: true,
    dailyDigest: false,
    weeklyReport: true,
    billingAlerts: true,
    browserPush: false,
  });

  const [slackWebhook, setSlackWebhook] = useState("");
  const [slackTested, setSlackTested] = useState(false);
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [minSeverity, setMinSeverity] = useState("warning");
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved">("idle");

  const toggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestSlack = () => {
    setSlackTested(true);
    setTimeout(() => setSlackTested(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus("saving");
    setTimeout(() => {
      setSavedStatus("saved");
      setTimeout(() => setSavedStatus("idle"), 3000);
    }, 600);
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notification Preferences</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Choose how and when Orbit notifies you about crashes, anomalies, and reports.
          </p>
        </div>

        {savedStatus === "saved" && (
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Preferences saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Incident Trigger Alerts */}
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Incident & Anomaly Alerts</h2>
              <p className="text-xs text-zinc-400">Determine which events dispatch immediate notifications.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div>
                <div className="text-sm font-medium text-white">Critical Outages & Crash Loops</div>
                <div className="text-xs text-zinc-400">High-priority alerts when service downtime exceeds threshold.</div>
              </div>
              <ToggleSwitch
                checked={preferences.criticalIncidents}
                onChange={() => toggle("criticalIncidents")}
                ariaLabel="Critical Outages Toggle"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div>
                <div className="text-sm font-medium text-white">Z-Score Metric Anomalies</div>
                <div className="text-xs text-zinc-400">When telemetry spikes beyond statistical normal distribution.</div>
              </div>
              <ToggleSwitch
                checked={preferences.warnings}
                onChange={() => toggle("warnings")}
                ariaLabel="Metric Anomalies Toggle"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div>
                <div className="text-sm font-medium text-white">Incident Resolution & Self-Healing Patches</div>
                <div className="text-xs text-zinc-400">Notify when Orbit AI Guardian generates a PR or issue resolves.</div>
              </div>
              <ToggleSwitch
                checked={preferences.resolvedIncidents}
                onChange={() => toggle("resolvedIncidents")}
                ariaLabel="Incident Resolution Toggle"
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                Minimum Alert Severity Threshold
              </label>
              <select
                value={minSeverity}
                onChange={(e) => setMinSeverity(e.target.value)}
                className="bg-black border border-white/20 focus:border-white rounded-lg px-3 py-2 text-sm text-white outline-none transition cursor-pointer"
              >
                <option value="all">All Events (Info, Warning, Critical)</option>
                <option value="warning">Warning & Critical Only</option>
                <option value="critical">Critical Outages Only</option>
              </select>
            </div>
          </div>
        </section>

        {/* Email & Digest Reports */}
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Scheduled Digests & Reports</h2>
              <p className="text-xs text-zinc-400">Summary emails sent directly to your verified inbox.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div>
                <div className="text-sm font-medium text-white">Daily Infrastructure Summary</div>
                <div className="text-xs text-zinc-400">Daily snapshot of error counts, throughput, and memory stats.</div>
              </div>
              <ToggleSwitch
                checked={preferences.dailyDigest}
                onChange={() => toggle("dailyDigest")}
                ariaLabel="Daily Digest Toggle"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div>
                <div className="text-sm font-medium text-white">Weekly Engineering Health Digest</div>
                <div className="text-xs text-zinc-400">Weekly APM breakdown, slowest endpoints, and crash statistics.</div>
              </div>
              <ToggleSwitch
                checked={preferences.weeklyReport}
                onChange={() => toggle("weeklyReport")}
                ariaLabel="Weekly Report Toggle"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-white">Billing & Quota Threshold Alerts</div>
                <div className="text-xs text-zinc-400">Notifies when event ingestion approaches 80% or 100% of plan limits.</div>
              </div>
              <ToggleSwitch
                checked={preferences.billingAlerts}
                onChange={() => toggle("billingAlerts")}
                ariaLabel="Billing Alerts Toggle"
              />
            </div>
          </div>
        </section>

        {/* Third-Party Webhooks & Integrations */}
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <RadioTower className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">External Channels & Webhooks</h2>
              <p className="text-xs text-zinc-400">Broadcast incidents directly into developer chat rooms.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 mb-1 uppercase tracking-wider">
                Slack Incoming Webhook URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="flex-1 bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white font-mono outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleTestSlack}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {slackTested ? <Check className="w-3.5 h-3.5 text-white" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{slackTested ? "Test Sent!" : "Test Webhook"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 mb-1 uppercase tracking-wider">
                Discord Incoming Webhook URL (Optional)
              </label>
              <input
                type="url"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-sm text-white font-mono outline-none transition"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savedStatus === "saving"}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {savedStatus === "saving" ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
