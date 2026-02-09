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
import { pnlByHour } from "@/lib/time_agg";

export default function PnlByHourChart({ trades = [] }: { trades?: Trade[] }) {
  const data = pnlByHour(trades);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Upload CSV to see hourly PnL
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis />
       <Tooltip
      contentStyle={{
        backgroundColor: "#0a0a0a",
        border: "1px solid #262626",
        borderRadius: "8px",
      }}
      labelStyle={{ color: "#a3a3a3", fontSize: "12px" }}
      itemStyle={{ color: "#e5e7eb" }}
      labelFormatter={(label) => `Hour: ${label}:00`}
      formatter={(value?: number) => [`${(value ?? 0).toFixed(2)}`, "PnL"]}

    />

        <Bar dataKey="pnl">
          {data.map((d, i) => (
            <Cell key={i} fill={d.pnl >= 0 ? "#22c55e" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
