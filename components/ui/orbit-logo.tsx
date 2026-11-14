"use client";

import Link from "next/link";
import { Radar } from "lucide-react";

interface OrbitLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string | null;
  badge?: string;
  showText?: boolean;
}

export function OrbitLogo({
  className = "",
  size = "md",
  href = "/dashboard",
  badge,
  showText = true,
}: OrbitLogoProps) {
  const sizeConfig = {
    sm: {
      circle: "w-6 h-6",
      icon: "w-3.5 h-3.5",
      text: "text-xs",
    },
    md: {
      circle: "w-7 h-7",
      icon: "w-4 h-4",
      text: "text-sm",
    },
    lg: {
      circle: "w-8 h-8",
      icon: "w-4.5 h-4.5",
      text: "text-base",
    },
  };

  const { circle, icon, text } = sizeConfig[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Signature Orbit Radar circular disc emblem */}
      <span className={`grid ${circle} place-items-center rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105`}>
        <Radar className={icon} strokeWidth={2.4} />
      </span>
      {showText && (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`font-black ${text} tracking-[-0.03em] uppercase text-[var(--text-primary)] leading-none truncate`}>
            ORBIT
          </span>
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-accent/15 text-accent border border-accent/25 leading-none shrink-0">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center min-w-0 transition hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
