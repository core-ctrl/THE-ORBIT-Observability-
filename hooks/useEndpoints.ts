"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { api } from "@/lib/api";
import { useOrbitStore } from "@/store/orbitStore";

export function useEndpoints() {
  const setEndpoints = useOrbitStore((state) => state.setEndpoints);
  const connected = useOrbitStore((state) => state.connected);

  const query = useQuery({
    queryKey: ["endpoints"],
    queryFn: api.endpoints,
    enabled: !connected,
    refetchInterval: connected ? false : 15000,
    staleTime: 10000
  });

  const prevEndpointsRef = useRef<string>("");
  useEffect(() => {
    if (query.data && !connected) {
      const serialized = JSON.stringify(query.data);
      if (serialized !== prevEndpointsRef.current) {
        prevEndpointsRef.current = serialized;
        setEndpoints(query.data);
      }
    }
  }, [query.data, connected, setEndpoints]);

  return query;
}

export function useEndpointHistory(name: string) {
  return useQuery({
    queryKey: ["endpoint-history", name],
    queryFn: () => api.endpointHistory(name),
    enabled: Boolean(name),
    refetchInterval: 15000
  });
}
