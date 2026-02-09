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

// 🔹 Custom tooltip
function PnlHourTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: number;
}) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;
  const isPositive = value >= 0;

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-sm">
      <div className="text-slate-400 text-xs mb-1">
        Hour: {label}:00
      </div>
      <div
        className={`font-semibold ${
          isPositive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        PnL: {value.toFixed(2)}
      </div>
    </div>
  );
}

export default function PnlByHourChart({
  trades = [],
}: {
  trades?: Trade[];
}) {
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

        <Tooltip cursor={false} content={<PnlHourTooltip />} />

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
