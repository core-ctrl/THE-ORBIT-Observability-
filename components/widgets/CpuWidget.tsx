"use client";

import { GaugeChart } from "@/components/charts/GaugeChart";
import { EmptyState } from "@/components/ui/empty-state";
import { WidgetFrame } from "@/components/widgets/WidgetFrame";
import { useOrbitStore } from "@/store/orbitStore";

export function CpuWidget({ onRemove }: { onRemove?: () => void }): JSX.Element {
  const cpuPercent = useOrbitStore((state) => state.system?.cpu_percent);
  return (
    <WidgetFrame title="CPU Usage" description="Host server CPU utilization percentage over time." onRemove={onRemove}>
      {cpuPercent !== undefined ? (
        <GaugeChart value={cpuPercent} />
      ) : (
        <EmptyState title="No CPU readings yet" description="Waiting for data..." />
      )}
    </WidgetFrame>
  );
}


