"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { useOrbitStore } from "@/store/orbitStore";

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== "undefined") {
    const loc = window.location;
    const host = loc.hostname || "localhost";
    return `ws://${host}:8000/ws/telemetry`;
  }
  return "ws://localhost:8000/ws/telemetry";
}

let wsRef: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let backgroundSuspendTimer: ReturnType<typeof setTimeout> | null = null;

export function useSocket(): void {
  useEffect(() => {
    let unmounted = false;
    let isPolling = true;

    // Resilient fallback HTTP polling: skips when WS is streaming or tab is hidden
    const pollBackend = async () => {
      if (!isPolling || unmounted) return;
      
      // Stop background activities when tab is not in use to save RAM and CPU
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }

      // If WebSocket is active and streaming, skip redundant HTTP requests
      if (wsRef && wsRef.readyState === WebSocket.OPEN) {
        return;
      }

      try {
        const [sysRes, epsRes, dbsRes, dockerRes, contRes, sslRes] = await Promise.allSettled([
          api.system(),
          api.endpoints(),
          api.databases(),
          api.dockerStatus(),
          api.containers(),
          api.ssl(),
        ]);

        let hasData = false;

        if (sysRes.status === "fulfilled" && sysRes.value) {
          useOrbitStore.getState().setSystem(sysRes.value);
          hasData = true;
        }

        if (epsRes.status === "fulfilled" && Array.isArray(epsRes.value)) {
          useOrbitStore.getState().setEndpoints(epsRes.value);
          hasData = true;
        }

        if (dbsRes.status === "fulfilled" && Array.isArray(dbsRes.value)) {
          useOrbitStore.getState().setDatabases(dbsRes.value);
          hasData = true;
        }

        if (dockerRes.status === "fulfilled" && dockerRes.value) {
          const conts = contRes.status === "fulfilled" && Array.isArray(contRes.value) ? contRes.value : [];
          useOrbitStore.getState().setDocker(dockerRes.value, conts);
          hasData = true;
        }

        if (sslRes.status === "fulfilled" && Array.isArray(sslRes.value)) {
          useOrbitStore.getState().setSsl(sslRes.value);
          hasData = true;
        }

        if (hasData) {
          useOrbitStore.getState().setConnected(true);
        }
      } catch {
        if (!wsRef || wsRef.readyState !== WebSocket.OPEN) {
          useOrbitStore.getState().setConnected(false);
        }
      }
    };

    // Immediate initial sync on mount
    pollBackend();

    // Fallback polling runs every 5s, but skips if WS is active or tab is hidden
    const pollInterval = setInterval(pollBackend, 5000);

    // Native RFC 6455 WebSocket connection
    function connectWs() {
      if (unmounted) return;
      if (typeof document !== "undefined" && document.hidden) return;
      if (wsRef && (wsRef.readyState === WebSocket.OPEN || wsRef.readyState === WebSocket.CONNECTING)) {
        return;
      }

      try {
        const wsUrl = getWsUrl();
        const ws = new WebSocket(wsUrl);
        wsRef = ws;

        ws.onopen = () => {
          useOrbitStore.getState().setConnected(true);
        };

        ws.onmessage = (event) => {
          // Immediately drop processing if tab is hidden to prevent RAM growth & re-renders
          if (typeof document !== "undefined" && document.hidden) return;

          try {
            const payload = JSON.parse(event.data);
            const { event: evt, data } = payload;
            if (evt === "session:ready") {
              useOrbitStore.getState().setConnected(true);
            } else if (evt === "system:update" && data) {
              useOrbitStore.getState().setSystem(data);
              useOrbitStore.getState().setConnected(true);
            } else if (evt === "containers:update" && data) {
              useOrbitStore.getState().setDocker(data.status, data.containers);
            } else if (evt === "databases:update" && data) {
              useOrbitStore.getState().setDatabases(data);
            } else if (evt === "endpoints:update" && data) {
              useOrbitStore.getState().setEndpoints(data);
            } else if (evt === "ssl:update" && data) {
              useOrbitStore.getState().setSsl(data);
            } else if (evt === "alert:new" && data) {
              useOrbitStore.getState().pushAlert(data);
            }
          } catch (e) {
            console.error("[Orbit] Error parsing WS message:", e);
          }
        };

        ws.onerror = () => {
          // Fallback HTTP polling handles recovery
        };

        ws.onclose = () => {
          wsRef = null;
          if (!unmounted && typeof document !== "undefined" && !document.hidden) {
            reconnectTimer = setTimeout(connectWs, 3000);
          }
        };
      } catch {
        wsRef = null;
        if (!unmounted && typeof document !== "undefined" && !document.hidden) {
          reconnectTimer = setTimeout(connectWs, 3000);
        }
      }
    }

    connectWs();

    // Page Visibility API handler: suspend background activities when inactive
    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;

      if (document.hidden) {
        // Tab moved to background: schedule socket suspension after 60s to free RAM
        if (backgroundSuspendTimer) clearTimeout(backgroundSuspendTimer);
        backgroundSuspendTimer = setTimeout(() => {
          if (wsRef) {
            wsRef.close();
            wsRef = null;
          }
        }, 60000);
      } else {
        // User returned to tab: cancel suspend timer, reconnect WS, and sync state immediately
        if (backgroundSuspendTimer) {
          clearTimeout(backgroundSuspendTimer);
          backgroundSuspendTimer = null;
        }
        pollBackend();
        connectWs();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      unmounted = true;
      isPolling = false;
      clearInterval(pollInterval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (backgroundSuspendTimer) clearTimeout(backgroundSuspendTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wsRef) {
        wsRef.close();
        wsRef = null;
      }
    };
  }, []);
}
