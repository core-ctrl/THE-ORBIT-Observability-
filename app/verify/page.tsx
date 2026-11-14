"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, 
  Check, 
  Fingerprint, 
  Globe2, 
  Lock, 
  Radar, 
  RefreshCw, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Terminal 
} from "lucide-react";
import { api, setToken } from "@/lib/api";

function VerificationPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const verificationSteps = [
    { label: "Decoding Token Payload", detail: "Validating JWT cryptographic hash" },
    { label: "Zero-Trust Handshake", detail: "Synchronizing with Orbit Core Engine" },
    { label: "Authorizing Workspace", detail: "Allocating initial telemetry tenant" },
  ];

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No authorization token detected in this verification link.");
      return;
    }

    const s1 = setTimeout(() => setActiveStep(1), 350);
    const s2 = setTimeout(() => setActiveStep(2), 700);

    const executeVerify = async () => {
      try {
        const data = await api.verify(token);
        setToken(data.access_token);
        setStatus("success");
      } catch (err: unknown) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "The token signature is invalid or has expired.");
      }
    };

    const s3 = setTimeout(executeVerify, 1100);

    return () => {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
    };
  }, [token]);

  // Countdown timer on success
  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/onboarding");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, router]);

  return (
    <div className="relative w-full max-w-xl">
      {/* ── Holographic Center Core ── */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#030708]/90 p-8 sm:p-11 shadow-[0_30px_100px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
        {/* Fine cyber grid mesh inside card */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "24px 24px"
          }}
        />

        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-[#1ad6ab]/60 to-transparent" />

        {/* ── STATE: LOADING / HANDSHAKE ── */}
        {status === "loading" && (
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Spinning Gyroscopic Ring Core */}
            <div className="relative my-4 flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-20" />
              {/* Outer ticked ring */}
              <div className="absolute inset-0 rounded-full border border-white/10 animate-spin" style={{ animationDuration: "16s" }}>
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#1ad6ab]" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-white/30" />
              </div>
              {/* Inner fast ring */}
              <div className="absolute inset-3 rounded-full border border-dashed border-[#1ad6ab]/40 animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }} />
              {/* Core emblem */}
              <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#0c2422] to-[#040e0d] border border-[#1ad6ab]/40 shadow-[0_0_40px_rgba(26,214,171,0.25)]">
                <Fingerprint className="h-8 w-8 text-[#1ad6ab] animate-pulse" />
              </div>
            </div>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.28em] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1ad6ab] animate-ping" />
              Protocol Handshake
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-[-0.04em] text-white">
              Authenticating Token
            </h1>
            <p className="mt-1 text-xs text-white/50 max-w-sm">
              Establishing a zero-trust cryptographic session with Orbit Core.
            </p>

            {/* Stepped Diagnostic Handshake Feed */}
            <div className="mt-6 w-full space-y-2 text-left">
              {verificationSteps.map((step, idx) => {
                const isDone = idx < activeStep;
                const isCurrent = idx === activeStep;
                return (
                  <div
                    key={step.label}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all duration-300 ${
                      isDone
                        ? "border-emerald-500/30 bg-emerald-500/[0.04] text-emerald-200"
                        : isCurrent
                        ? "border-[#1ad6ab]/40 bg-[#1ad6ab]/[0.08] text-white shadow-[0_0_20px_rgba(26,214,171,0.1)]"
                        : "border-white/5 bg-white/[0.02] text-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`grid h-5 w-5 place-items-center rounded-md text-[9px] font-bold ${
                        isDone ? "bg-emerald-500/20 text-emerald-400" : isCurrent ? "bg-[#1ad6ab]/20 text-[#1ad6ab]" : "bg-white/5 text-white/40"
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-tight">{step.label}</p>
                        <p className="text-[9px] text-white/40">{step.detail}</p>
                      </div>
                    </div>
                    {isDone ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="h-3 w-3 rounded-full border-2 border-[#1ad6ab] border-t-transparent animate-spin" />
                    ) : (
                      <span className="text-[9px] font-mono text-white/20">PENDING</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STATE: SUCCESS ── */}
        {status === "success" && (
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Glowing Success Node */}
            <div className="relative my-4 flex h-32 w-32 items-center justify-center">
              {/* Radial bloom */}
              <div className="absolute inset-0 rounded-full bg-[#1ad6ab]/15 blur-2xl" />
              {/* Rotating outer ring */}
              <div className="absolute inset-0 rounded-full border border-[#1ad6ab]/30 animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-2 rounded-full border border-dashed border-white/10" />
              {/* Solid central badge */}
              <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-tr from-[#052b24] via-[#0b4d40] to-[#1ad6ab] p-0.5 shadow-[0_0_50px_rgba(26,214,171,0.4)]">
                <div className="grid h-full w-full place-items-center rounded-[22px] bg-[#031512]">
                  <ShieldCheck className="h-10 w-10 text-[#1ad6ab]" />
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Identity Confirmed // 200 OK
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-[-0.04em] text-white">
              Signal Acquired
            </h1>
            <p className="mt-1 max-w-sm text-xs sm:text-sm text-white/60 leading-relaxed font-medium">
              Your email credentials have been authenticated. Gateway clearance granted.
            </p>

            {/* Verification Metadata Ticker */}
            <div className="mt-6 grid grid-cols-3 gap-2 w-full text-left">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35 block">Access</span>
                <span className="text-xs font-bold text-white mt-0.5 block flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1ad6ab]" /> Granted
                </span>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35 block">Tenant</span>
                <span className="text-xs font-bold text-[#1ad6ab] mt-0.5 block truncate">Orbit Cloud</span>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35 block">Redirect In</span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block">00:0{countdown}s</span>
              </div>
            </div>

            {/* Launch CTA Button */}
            <button
              onClick={() => router.push("/onboarding")}
              className="mt-7 w-full group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#1ad6ab] py-3.5 px-6 text-xs sm:text-sm font-black uppercase tracking-[0.14em] text-[#021310] transition-all duration-300 hover:bg-[#20e9bc] hover:shadow-[0_0_40px_rgba(26,214,171,0.5)] active:scale-[0.98] cursor-pointer"
            >
              <span>Initialize Workspace</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* ── STATE: ERROR ── */}
        {status === "error" && (
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Warning Core */}
            <div className="relative my-4 flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl" />
              <div className="absolute inset-0 rounded-full border border-red-500/20" />
              <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-tr from-[#2d0a0a] via-[#451010] to-[#ef4444] p-0.5 shadow-[0_0_50px_rgba(239,68,68,0.35)]">
                <div className="grid h-full w-full place-items-center rounded-[22px] bg-[#120404]">
                  <ShieldAlert className="h-10 w-10 text-red-400" />
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-red-300">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Verification Incomplete
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-[-0.04em] text-white">
              Signature Invalid
            </h1>
            <p className="mt-1 max-w-sm text-xs sm:text-sm text-white/55 leading-relaxed">
              {errorMsg}
            </p>

            <div className="mt-7 flex w-full flex-col sm:flex-row items-center gap-3">
              <Link
                href="/login"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white py-3 px-5 text-xs font-black uppercase tracking-[0.1em] text-black transition hover:bg-zinc-200"
              >
                Go to Sign In
              </Link>
              <Link
                href="/register"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-3 px-5 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
              >
                <RefreshCw className="h-3.5 w-3.5 text-white/60" />
                New Account
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Sub-card Telemetry Info (Distinct from Landing Page) ── */}
      <div className="mt-4 flex items-center justify-between px-3 text-[10px] font-mono uppercase tracking-[0.15em] text-white/35">
        <span className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-[#1ad6ab]" />
          256-Bit TLS Handshake
        </span>
        <span className="hidden sm:inline">Orbit Core Sentinel</span>
        <span>Zero-Trust Architecture</span>
      </div>
    </div>
  );
}

export default function VerifyPage(): JSX.Element {
  return (
    <main className="relative min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#020506] p-4 sm:p-6 text-white selection:bg-[#1ad6ab] selection:text-black">
      {/* ── Background Cyber Luminescence ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle cyber grid */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: "48px 48px"
          }}
        />
        {/* Deep atmospheric glow pools */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(26,214,171,0.12),rgba(59,130,246,0.06),transparent_70%)] blur-3xl" />
        <div className="absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.14),transparent_65%)] blur-3xl" />
      </div>

      {/* ── Top Bar ── */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between py-2">
        <Link href="/" className="group flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[-0.04em] transition hover:opacity-80">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            <Radar className="h-4 w-4" />
          </span>
          <span className="font-bold tracking-tight text-white group-hover:text-[#1ad6ab] transition-colors">Orbit</span>
        </Link>

        {/* Live System Beacon */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-[10px] font-mono text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1ad6ab] animate-pulse" />
          <span>GATEWAY: <strong className="text-white">ONLINE</strong></span>
        </div>

        <Link
          href="/login"
          className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Sign In
        </Link>
      </header>

      {/* ── Center Stage ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center py-8">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-3 text-white/40 font-mono text-xs">
            <div className="h-6 w-6 rounded-full border-2 border-[#1ad6ab] border-t-transparent animate-spin" />
            <span>ESTABLISHING SECURE CONTEXT...</span>
          </div>
        }>
          <VerificationPortal />
        </Suspense>
      </div>

      {/* ── Minimalist Bottom Telemetry ── */}
      <footer className="relative z-10 mx-auto flex w-full max-w-5xl flex-col sm:flex-row items-center justify-between border-t border-white/[0.06] pt-4 text-[10px] font-mono text-white/40">
        <span>ORBIT SECURITY INFRASTRUCTURE // v3.2</span>
        <span className="mt-1 sm:mt-0">SECURE ENCLAVE VERIFIED</span>
      </footer>
    </main>
  );
}
