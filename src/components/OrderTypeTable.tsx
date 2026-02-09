"use client";

import type { Trade } from "@/lib/types";
import { orderTypePerformance } from "@/lib/leaderboards";

export default function OrderTypeTable({ trades = [] }: { trades?: Trade[] }) {
  const rows = orderTypePerformance(trades);

  if (!rows.length) {
    return (
      <div className="text-sm text-neutral-500">
        Upload CSV to see order type performance
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-neutral-400">
          <tr>
            <th className="px-3 py-2 text-left">Order type</th>
            <th className="px-3 py-2 text-right">Trades</th>
            <th className="px-3 py-2 text-right">Win rate</th>
            <th className="px-3 py-2 text-right">Total PnL</th>
            <th className="px-3 py-2 text-right">Avg PnL</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr
              key={r.orderType}
              className="border-t border-white/10 hover:bg-white/5"
            >
              <td className="px-3 py-2 capitalize">
                {r.orderType}
              </td>

              <td className="px-3 py-2 text-right">
                {r.trades}
              </td>

              <td className="px-3 py-2 text-right">
                {(r.winRate * 100).toFixed(1)}%
              </td>

              <td
                className={`px-3 py-2 text-right font-medium ${
                  r.totalPnl >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatPnl(r.totalPnl)}
              </td>

              <td
                className={`px-3 py-2 text-right ${
                  r.avgPnl >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatPnl(r.avgPnl)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatPnl(v: number) {
  const sign = v > 0 ? "+" : "";
  return sign + v.toFixed(2);
}
