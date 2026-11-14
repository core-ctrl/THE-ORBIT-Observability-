import { create } from "zustand";

import type {
  AlertItem,
  ContainerMetric,
  DatabaseHealth,
  DockerStatus,
  EndpointMetric,
  LogEntry,
  SslCertificate,
  SystemMetric
} from "@/types/orbit";

interface OrbitState {
  connected: boolean;
  system: SystemMetric | null;
  systemHistory: SystemMetric[];
  docker: DockerStatus | null;
  containers: ContainerMetric[];
  endpoints: EndpointMetric[];
  databases: DatabaseHealth[];
  ssl: SslCertificate[];
  alerts: AlertItem[];
  logs: LogEntry[];
  guardianSidebarOpen: boolean;
  setConnected: (connected: boolean) => void;
  setSystem: (system: SystemMetric) => void;
  setDocker: (docker: DockerStatus, containers: ContainerMetric[]) => void;
  setEndpoints: (endpoints: EndpointMetric[]) => void;
  setDatabases: (databases: DatabaseHealth[]) => void;
  setSsl: (ssl: SslCertificate[]) => void;
  setAlerts: (alerts: AlertItem[]) => void;
  pushAlert: (alert: AlertItem) => void;
  pushLog: (log: LogEntry) => void;
  setGuardianSidebarOpen: (open: boolean) => void;
  toggleGuardianSidebar: () => void;
}

export const useOrbitStore = create<OrbitState>((set) => ({
  connected: false,
  guardianSidebarOpen: false,
  system: null,
  systemHistory: [],
  docker: null,
  containers: [],
  endpoints: [],
  databases: [],
  ssl: [],
  alerts: [],
  logs: [],
  setGuardianSidebarOpen: (guardianSidebarOpen) => set({ guardianSidebarOpen }),
  toggleGuardianSidebar: () => set((state) => ({ guardianSidebarOpen: !state.guardianSidebarOpen })),
  setConnected: (connected) =>
    set((state) => (state.connected === connected ? state : { connected })),
  setSystem: (system) =>
    set((state) => {
      const defaults: SystemMetric = {
        timestamp: new Date().toISOString(),
        cpu_percent: 0,
        cpu_per_core: [],
        cpu_count: 8,
        cpu_freq_mhz: null,
        memory_percent: 0,
        memory_used: 0,
        memory_total: 16 * 1024 * 1024 * 1024,
        memory_available: 0,
        disk_percent: 0,
        disk_used: 0,
        disk_total: 512 * 1024 * 1024 * 1024,
        network_rx: 0,
        network_tx: 0,
        network_rx_bps: 0,
        network_tx_bps: 0,
        boot_time: new Date().toISOString(),
        uptime_seconds: 3600,
        uptime_str: "Online",
        hostname: "orbit-host",
        os_platform: "Windows",
        load_1m: null,
        load_5m: null,
        load_15m: null,
      };
      const normalized: SystemMetric = Object.assign({}, defaults, system);
      if (!Array.isArray(normalized.cpu_per_core)) normalized.cpu_per_core = [];
      return { system: normalized, systemHistory: [...state.systemHistory, normalized].slice(-40) };
    }),
  setDocker: (docker, containers) =>
    set((state) => {
      const statusSame =
        state.docker?.available === docker.available &&
        state.docker?.enabled === docker.enabled &&
        state.docker?.error === docker.error;
      const containersSame =
        state.containers.length === containers.length &&
        state.containers.every(
          (c, i) =>
            c.id === containers[i]?.id &&
            c.status === containers[i]?.status &&
            c.cpu_percent === containers[i]?.cpu_percent &&
            c.memory_usage === containers[i]?.memory_usage
        );
      if (statusSame && containersSame) return state;
      return { docker, containers };
    }),
  setEndpoints: (endpoints) =>
    set((state) => {
      if (
        state.endpoints.length === endpoints.length &&
        state.endpoints.every(
          (ep, i) =>
            ep.name === endpoints[i]?.name &&
            ep.status === endpoints[i]?.status &&
            ep.latency_ms === endpoints[i]?.latency_ms
        )
      ) {
        return state;
      }
      return { endpoints };
    }),
  setDatabases: (databases) =>
    set((state) => {
      if (
        state.databases.length === databases.length &&
        state.databases.every(
          (db, i) =>
            db.name === databases[i]?.name &&
            db.status === databases[i]?.status &&
            db.latency_ms === databases[i]?.latency_ms
        )
      ) {
        return state;
      }
      return { databases };
    }),
  setSsl: (ssl) =>
    set((state) => {
      if (
        state.ssl.length === ssl.length &&
        state.ssl.every(
          (s, i) =>
            s.domain === ssl[i]?.domain &&
            s.days_remaining === ssl[i]?.days_remaining &&
            s.status === ssl[i]?.status
        )
      ) {
        return state;
      }
      return { ssl };
    }),
  setAlerts: (alerts) => set({ alerts }),
  pushAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 100) })),
  pushLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 200) }))
}));
