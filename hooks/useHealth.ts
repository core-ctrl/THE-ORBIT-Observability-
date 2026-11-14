"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { api } from "@/lib/api";
import { useOrbitStore } from "@/store/orbitStore";

export function useHealth() {
  const setDatabases = useOrbitStore((state) => state.setDatabases);
  const setSsl = useOrbitStore((state) => state.setSsl);
  const setAlerts = useOrbitStore((state) => state.setAlerts);
  const connected = useOrbitStore((state) => state.connected);

  // If WebSocket is connected, live stream provides updates; query only runs as fallback
  const databases = useQuery({
    queryKey: ["databases"],
    queryFn: api.databases,
    enabled: !connected,
    refetchInterval: connected ? false : 30000,
    staleTime: 20000
  });

  const ssl = useQuery({
    queryKey: ["ssl"],
    queryFn: api.ssl,
    enabled: !connected,
    refetchInterval: connected ? false : 60000,
    staleTime: 40000
  });

  const alerts = useQuery({
    queryKey: ["alerts"],
    queryFn: api.alerts,
    enabled: !connected,
    refetchInterval: connected ? false : 30000,
    staleTime: 20000
  });

  // Only synchronize into Zustand if query has new data and store is disconnected
  const prevDbRef = useRef<string>("");
  useEffect(() => {
    if (databases.data && !connected) {
      const serialized = JSON.stringify(databases.data);
      if (serialized !== prevDbRef.current) {
        prevDbRef.current = serialized;
        setDatabases(databases.data);
      }
    }
  }, [databases.data, connected, setDatabases]);

  const prevSslRef = useRef<string>("");
  useEffect(() => {
    if (ssl.data && !connected) {
      const serialized = JSON.stringify(ssl.data);
      if (serialized !== prevSslRef.current) {
        prevSslRef.current = serialized;
        setSsl(ssl.data);
      }
    }
  }, [ssl.data, connected, setSsl]);

  const prevAlertsRef = useRef<string>("");
  useEffect(() => {
    if (alerts.data && !connected) {
      const serialized = JSON.stringify(alerts.data);
      if (serialized !== prevAlertsRef.current) {
        prevAlertsRef.current = serialized;
        setAlerts(alerts.data);
      }
    }
  }, [alerts.data, connected, setAlerts]);

  return { databases, ssl, alerts };
}
