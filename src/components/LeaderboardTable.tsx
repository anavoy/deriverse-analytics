"use client";

import type { Trade } from "@/lib/types";
import { symbolLeaderboard } from "@/lib/leaderboards";

export default function LeaderboardTable({
  trades = [],
  onSymbolClick,
}: {
  trades?: Trade[];
  onSymbolClick?: (symbol: string) => void;
}) {
  const rows = symbolLeaderboard(trades);

  if (!rows.length) {
    return (
      <div className="text-sm text-neutral-500">
        Upload CSV to see symbol leaderboard
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-neutral-400">
          <tr>
            <th className="px-3 py-2 text-left">Symbol</th>
            <th className="px-3 py-2 text-right">Trades</th>
            <th className="px-3 py-2 text-right">Win rate</th>
            <th className="px-3 py-2 text-right">Total PnL</th>
            <th className="px-3 py-2 text-right">Avg PnL</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr
              key={r.symbol}
              className="border-t border-white/10 hover:bg-white/5"
            >
              {/* SYMBOL (clickable) */}
              <td className="px-3 py-2 font-medium">
                {onSymbolClick ? (
                  <button
                    onClick={() => onSymbolClick(r.symbol)}
                    className="hover:underline hover:text-white"
                  >
                    {r.symbol}
                  </button>
                ) : (
                  r.symbol
                )}
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
