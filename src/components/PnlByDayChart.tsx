"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

import type { Trade } from "@/lib/types";
import { pnlByDay } from "@/lib/time_agg";

export default function PnlByDayChart({ trades = [] }: { trades?: Trade[] }) {
  const data = pnlByDay(trades);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Upload CSV to see daily PnL
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        {/* <Tooltip
    contentStyle={{
      backgroundColor: "#0a0a0a",
      border: "1px solid #262626",
      borderRadius: "8px",
    }}
    labelStyle={{ color: "#a3a3a3", fontSize: "12px" }}
    itemStyle={{ color: "#e5e7eb" }}
    labelFormatter={(label) => `Date: ${label}`}
    formatter={(value?: number) => [`${(value ?? 0).toFixed(2)}`, "PnL"]}
  /> */}

  <Tooltip
  cursor={false}
  contentStyle={{
    backgroundColor: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: "8px",
  }}
/>




        <Bar dataKey="pnl">
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.pnl >= 0 ? "#22c55e" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
