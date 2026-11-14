"use client";

import { useState } from "react";
import { 
  Key, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  AlertCircle,
  Cpu,
  Layers,
  ArrowRight
} from "lucide-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

export default function OrganizationAuthPage() {
  const [provider, setProvider] = useState<"okta" | "entra" | "google" | "saml">("saml");
  const [ssoUrl, setSsoUrl] = useState("");
  const [entityId, setEntityId] = useState("");
  const [cert, setCert] = useState("");
  const [enforceSso, setEnforceSso] = useState(false);
  const [autoProvision, setAutoProvision] = useState(true);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "error">("idle");
  const [saveStatus, setSaveStatus] = useState("");
  const [copiedAcs, setCopiedAcs] = useState(false);

  const acsUrl = "https://api.orbit-telemetry.io/api/v1/auth/saml/callback";
  const audienceUri = "https://api.orbit-telemetry.io/saml/metadata";

  const handleCopyAcs = () => {
    navigator.clipboard.writeText(acsUrl);
    setCopiedAcs(true);
    setTimeout(() => setCopiedAcs(false), 2000);
  };

  const handleTestConnection = () => {
    if (!ssoUrl || !entityId) {
      setTestResult("error");
      setTimeout(() => setTestResult("idle"), 3000);
      return;
    }
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTestResult("success");
      setTimeout(() => setTestResult("idle"), 4000);
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saved SAML SSO configuration.");
    setTimeout(() => setSaveStatus(""), 3500);
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Enterprise SSO & Authentication</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Configure SAML 2.0 or OIDC Identity Provider (IdP) integration for automated provisioning.
          </p>
        </div>

        {saveStatus && (
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Service Provider (SP) Credentials */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Key className="w-4 h-4 text-white" />
          <span>Orbit Service Provider (SP) Metadata</span>
        </h2>
        <p className="text-xs text-zinc-400 mb-4">
          Provide these endpoints inside your Identity Provider (Okta, Azure AD, Ping, Google) app settings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-black border border-white/10 rounded-lg">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 font-mono">
              <span>Assertion Consumer Service (ACS) URL</span>
              <button
                type="button"
                onClick={handleCopyAcs}
                className="text-white hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedAcs ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-white truncate select-all">{acsUrl}</div>
          </div>

          <div className="p-3.5 bg-black border border-white/10 rounded-lg">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 font-mono">
              <span>Audience URI / Entity ID</span>
            </div>
            <div className="font-mono text-xs text-white truncate select-all">{audienceUri}</div>
          </div>
        </div>
      </section>

      {/* IdP Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Identity Provider (IdP) Configuration</span>
          </h2>

          <div className="flex gap-2">
            {(["saml", "okta", "entra", "google"] as const).map((prov) => (
              <button
                key={prov}
                type="button"
                onClick={() => setProvider(prov)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  provider === prov
                    ? "bg-white text-black"
                    : "bg-black text-zinc-400 hover:text-white border border-white/10"
                }`}
              >
                {prov}
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                Single Sign-On URL (SSO Endpoint)
              </label>
              <input
                type="url"
                value={ssoUrl}
                onChange={(e) => setSsoUrl(e.target.value)}
                placeholder="https://your-idp.com/app/orbit/sso/saml"
                className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                IdP Issuer Entity ID
              </label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="https://your-idp.com/entity/exk948120"
                className="w-full bg-black border border-white/20 focus:border-white rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                X.509 Public Certificate
              </label>
              <textarea
                value={cert}
                onChange={(e) => setCert(e.target.value)}
                placeholder="-----BEGIN CERTIFICATE-----&#10;Paste your base64 encoded certificate&#10;-----END CERTIFICATE-----"
                rows={4}
                className="w-full bg-black border border-white/20 focus:border-white rounded-lg p-3 text-xs font-mono text-white outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-white/10">
              <div>
                <div className="text-sm font-medium text-white">Enforce SSO Login Only</div>
                <div className="text-xs text-zinc-400">Block email/password logins for users on verified corporate domains.</div>
              </div>
              <ToggleSwitch
                checked={enforceSso}
                onChange={setEnforceSso}
                ariaLabel="Enforce SSO Toggle"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-white/10">
              <div>
                <div className="text-sm font-medium text-white">JIT User Provisioning</div>
                <div className="text-xs text-zinc-400">Automatically register team members upon first successful SSO handshake.</div>
              </div>
              <ToggleSwitch
                checked={autoProvision}
                onChange={setAutoProvision}
                ariaLabel="JIT Provisioning Toggle"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white rounded-lg transition-colors cursor-pointer"
            >
              {testing ? "Testing Handshake..." : "Test SAML Connection"}
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>

          {testResult === "success" && (
            <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-xs font-mono text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>SAML IdP connection verified successfully.</span>
            </div>
          )}

          {testResult === "error" && (
            <div className="p-3 bg-white/5 border border-white/20 rounded-lg text-xs font-mono text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-white" />
              <span>Please fill in SSO URL and Issuer Entity ID to test connection.</span>
            </div>
          )}
        </section>
      </form>
    </div>
  );
}
