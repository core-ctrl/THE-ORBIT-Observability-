# Performance & Load Profiling (performance.md)

- **Average Page Switch Latency:** `4419.8ms`
- **Fastest Route:** `/dashboard`
- **Slowest Route:** `/dashboard/errors`

## Memory and Re-Render Considerations
- Background Tab Inactivity suspends WebSocket streaming and TanStack query polling.
- Store buffer clamping limits alert logs to 50 items and telemetry history to 30 snapshots.
