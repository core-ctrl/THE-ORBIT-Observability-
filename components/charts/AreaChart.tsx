"use client";

import { memo, useId } from "react";
import {
  Area,
  AreaChart as RechartAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export interface ChartPoint {
  label: string;
  value: number;
}

export const AreaChart = memo(function AreaChart({
  data,
  color = "#ffffff",
  unit = ""
}: {
  data: ChartPoint[];
  color?: string;
  unit?: string;
}): JSX.Element {
  const rawId = useId();
  const gradientId = `gradient-${rawId.replace(/:/g, "")}-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartAreaChart data={data} margin={{ left: -24, right: 8, top: 12, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#09090b", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: 12, color: "#ffffff" }}
          formatter={(value: number) => [`${value}${unit}`, "Value"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </RechartAreaChart>
    </ResponsiveContainer>
  );
});
