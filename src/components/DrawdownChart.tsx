"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import type { EquityPoint } from "@/lib/drawdown";

export default function DrawdownChart({ data }: { data: EquityPoint[] }) {
  if (!data?.length) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
      >
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["dataMin", 0]} />
        <Tooltip
  cursor={false}
  contentStyle={{
    backgroundColor: "#0a0a0a",
    border: "1px solid #262626",
    borderRadius: "8px",
    color: "#e5e7eb",
    fontSize: "12px",
  }}
  labelStyle={{
    color: "#e5e7eb",
    fontWeight: 500,
    marginBottom: "4px",
  }}
  itemStyle={{ color: "#ef4444" }}
  labelFormatter={(label) => {
    const d = new Date(label);
    return d.toLocaleString();
  }}
  formatter={(value?: number) => {
    if (value == null) return null;
    return [`${value.toFixed(2)}%`, "Drawdown"];
  }}
/>

        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.25}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
