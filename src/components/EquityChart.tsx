"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from "recharts";

import type { Trade } from "@/lib/types";
import { buildEquityCurve } from "@/lib/equity";

export default function EquityChart({ trades = [] }: { trades?: Trade[] }) {
  const data = buildEquityCurve(trades);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Upload CSV to see equity curve
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
  <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
  <XAxis dataKey="t" hide />
  <YAxis />
  <Tooltip
  contentStyle={{
    backgroundColor: "#0a0a0a",
    border: "1px solid #262626",
    borderRadius: "8px",
  }}
  labelStyle={{ color: "#a3a3a3", fontSize: "12px" }}
  itemStyle={{ color: "#e5e7eb" }}
  labelFormatter={(label) => {
    const d = new Date(label);
    return d.toLocaleString();
  }}
  formatter={(value?: number, name?: string) => {
    if (name === "drawdown") return null; // 👈 sakrij drawdown iz tooltipa
    return [`${(value ?? 0).toFixed(2)}`, name];
  }}
/>


  {/* Equity */}
  <Line
    type="monotone"
    dataKey="equity"
    stroke="#22c55e"
    strokeWidth={2}
    dot={false}
  />

  {/* Peak */}
  <Line
    type="monotone"
    dataKey="peak"
    stroke="#e5e7eb"
    strokeDasharray="4 4"
    dot={false}
  />

  {/* Drawdown */}
  <Area
    type="monotone"
    dataKey="drawdown"
    stroke="#ef4444"
    fill="#ef4444"
    fillOpacity={0.2}
  />
</LineChart>

    </ResponsiveContainer>
  );
}
