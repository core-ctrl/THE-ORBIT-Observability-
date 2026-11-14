"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Check, 
  Zap, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default function SubscriptionsBillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [upgradeNotice, setUpgradeNotice] = useState("");

  const plans = [
    {
      name: "Developer Starter",
      price: billingCycle === "monthly" ? "$0" : "$0",
      description: "For personal projects and prototype telemetry monitoring.",
      features: [
        "100,000 telemetry events / mo",
        "7-day error & trace retention",
        "Community support & docs",
        "Standard health pings",
      ],
      current: false,
      cta: "Downgrade",
    },
    {
      name: "Team Pro",
      price: billingCycle === "monthly" ? "$49" : "$39",
      description: "Ideal for growing startups needing live incident alerts and APM.",
      features: [
        "1,000,000 telemetry events / mo",
        "30-day error & trace retention",
        "Orbit AI Guardian (100 analyses / mo)",
        "Slack & Discord webhook integrations",
        "Unlimited project workspaces",
      ],
      current: false,
      cta: "Switch Plan",
    },
    {
      name: "Enterprise Cloud",
      price: billingCycle === "monthly" ? "$249" : "$199",
      description: "Full-scale self-healing infrastructure, unlimited events & dedicated sidecars.",
      features: [
        "Unlimited telemetry events & logs",
        "90-day retention & cold storage",
        "Unrestricted Orbit AI Guardian diagnoses",
        "Automated Git patch PR self-healing",
        "SAML 2.0 / Okta SSO & SCIM",
        "99.99% Uptime SLA & Priority SRE Support",
      ],
      current: true,
      badge: "Active Plan",
      cta: "Manage Tier",
    },
  ];

  const invoices = [
    { id: "INV-2026-004", date: "Oct 01, 2026", amount: "$249.00", status: "Paid" },
    { id: "INV-2026-003", date: "Sep 01, 2026", amount: "$249.00", status: "Paid" },
  ];

  const handlePlanClick = (name: string) => {
    setUpgradeNotice(`Payment portal link generated for ${name}...`);
    setTimeout(() => setUpgradeNotice(""), 3500);
  };

  return (
    <div className="p-8 max-w-5xl space-y-8 animate-fade-in text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Subscriptions & Billing</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your subscription tier, telemetry quotas, invoices, and payment methods.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="bg-black p-1 rounded-lg border border-white/20 flex items-center self-start sm:self-auto">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
              billingCycle === "monthly" ? "bg-white text-black shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annually")}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              billingCycle === "annually" ? "bg-white text-black shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Annually</span>
            <span className="text-[9px] font-mono bg-white/20 px-1 py-0.2 rounded">Save 20%</span>
          </button>
        </div>
      </div>

      {upgradeNotice && (
        <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-xs text-white flex items-center gap-2 font-mono animate-fade-in">
          <Zap className="w-4 h-4 text-white" />
          <span>{upgradeNotice}</span>
        </div>
      )}

      {/* Usage Quotas Overview */}
      <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">
          Current Billing Cycle Telemetry Usage
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-zinc-400">Events Ingested</span>
              <span className="font-bold text-white">642,390 / 1,000,000</span>
            </div>
            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/10">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: "64%" }} />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">Resets in 11 days (Nov 01, 2026)</p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-zinc-400">AI Guardian Diagnoses</span>
              <span className="font-bold text-white">412 / Unlimited</span>
            </div>
            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/10">
              <div className="bg-white/80 h-full rounded-full transition-all duration-500" style={{ width: "41%" }} />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">Full multi-model LLM access active</p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-zinc-400">Log Storage & Retention</span>
              <span className="font-bold text-white">90 Days Full Resolution</span>
            </div>
            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/10">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: "100%" }} />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">Enterprise Cold Storage enabled</p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
              plan.current
                ? "bg-zinc-950 border-2 border-white shadow-2xl relative"
                : "bg-black border border-white/10 hover:border-white/30"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 right-6 bg-white text-black text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow">
                {plan.badge}
              </span>
            )}

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                {plan.name}
                {plan.current && <Sparkles className="w-4 h-4 text-white" />}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">{plan.description}</p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-white font-mono">{plan.price}</span>
                <span className="text-xs text-zinc-500 font-mono"> / month</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-white/10">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2 text-xs text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => handlePlanClick(plan.name)}
                className={`w-full py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  plan.current
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-900 border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method & Invoices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Method */}
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm md:col-span-1">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-white" />
            <span>Payment Method</span>
          </h2>

          <div className="bg-black border border-white/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">VISA</span>
              <span className="text-[10px] font-mono bg-white text-black px-1.5 py-0.2 rounded font-bold">Default</span>
            </div>
            <div className="text-sm font-mono text-white tracking-wider mb-2">•••• •••• •••• 4242</div>
            <div className="text-[11px] font-mono text-zinc-400">Expires 12/28</div>
          </div>

          <button
            onClick={() => setUpgradeNotice("Stripe payment portal launching...")}
            className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white rounded-lg transition-colors cursor-pointer"
          >
            Update Payment Card
          </button>
        </section>

        {/* Invoice History */}
        <section className="bg-zinc-950 border border-white/10 rounded-xl p-6 shadow-sm md:col-span-2">
          <h2 className="text-sm font-bold text-white mb-3">Billing History & Invoices</h2>

          <div className="divide-y divide-white/10">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-bold text-white">{inv.id}</div>
                  <div className="text-[11px] font-mono text-zinc-400">{inv.date}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-white">{inv.amount}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono font-bold border border-white/20">
                    {inv.status}
                  </span>
                  <button
                    onClick={() => setUpgradeNotice(`Downloading invoice ${inv.id} PDF...`)}
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Download Invoice PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
