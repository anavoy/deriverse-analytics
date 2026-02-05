import type { Trade } from "./types";
import { pnlForTrade } from "./metrics";

export type SymbolPerf = {
  symbol: string;
  trades: number;
  winRate: number;     // 0..1
  totalPnl: number;
  avgPnl: number;
};

export type OrderTypePerf = {
  orderType: string;
  trades: number;
  winRate: number;     // 0..1
  totalPnl: number;
  avgPnl: number;
};

function winRateFromPnls(pnls: number[]) {
  if (pnls.length === 0) return 0;
  const wins = pnls.filter((p) => p > 0).length;
  return wins / pnls.length;
}

export function symbolLeaderboard(trades: Trade[]): SymbolPerf[] {
  const map = new Map<string, number[]>();

  for (const t of trades) {
    const key = t.symbol || "UNKNOWN";
    const arr = map.get(key) ?? [];
    arr.push(pnlForTrade(t));
    map.set(key, arr);
  }

  return Array.from(map.entries()).map(([symbol, pnls]) => {
    const totalPnl = pnls.reduce((s, x) => s + x, 0);
    const tradesCount = pnls.length;
    return {
      symbol,
      trades: tradesCount,
      winRate: winRateFromPnls(pnls),
      totalPnl,
      avgPnl: tradesCount ? totalPnl / tradesCount : 0,
    };
  }).sort((a, b) => b.totalPnl - a.totalPnl);
}

export function orderTypePerformance(trades: Trade[]): OrderTypePerf[] {
  const map = new Map<string, number[]>();

  for (const t of trades) {
    const key = (t.orderType && String(t.orderType).trim()) ? String(t.orderType).trim() : "unknown";
    const arr = map.get(key) ?? [];
    arr.push(pnlForTrade(t));
    map.set(key, arr);
  }

  return Array.from(map.entries()).map(([orderType, pnls]) => {
    const totalPnl = pnls.reduce((s, x) => s + x, 0);
    const tradesCount = pnls.length;
    return {
      orderType,
      trades: tradesCount,
      winRate: winRateFromPnls(pnls),
      totalPnl,
      avgPnl: tradesCount ? totalPnl / tradesCount : 0,
    };
  }).sort((a, b) => b.totalPnl - a.totalPnl);
}
