"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/api";

/**
 * Automatically logs out user if idle for `timeoutMs` (default: 15 minutes).
 */
export function useIdleTimer(timeoutMs: number = 15 * 60 * 1000): void {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track idle timer if user is authenticated
    if (!getToken()) return;

    const handleTimeout = () => {
      clearToken();
      router.replace("/login?expired=1");
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleTimeout, timeoutMs);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [router, timeoutMs]);
}
