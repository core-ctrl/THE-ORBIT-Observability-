"use client";

import { memo } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import type { ChartPoint } from "@/components/charts/AreaChart";

export const Sparkline = memo(function Sparkline({ data, color = "#ffffff" }: { data: ChartPoint[]; color?: string }): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data}>
        <Line type="monotone" dot={false} dataKey="value" stroke={color} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
});
