import type { Trade } from "./types";

export type Metrics = {
  tradeCount: number;
  winRate: number;         // 0..1
  totalPnl: number;
  totalFees: number;
  grossPnl: number;        // pnl + fees (ako fees oduzimamo)
  avgWin: number;
  avgLoss: number;         // negative number
  largestWin: number;
  largestLoss: number;     // negative number
  avgDurationMinutes: number;
  longCount: number;
  shortCount: number;
  longShortRatio: number;  // longCount/shortCount (Infinity if short=0)
};

function calcPnl(t: Trade): number {
  if (typeof t.realizedPnl === "number") return t.realizedPnl;
  const direction = t.side === "LONG" ? 1 : -1;
  // basic: (exit-entry) * size * direction - fees
  return (t.exitPrice - t.entryPrice) * t.size * direction - (t.fees ?? 0);
}
export function pnlForTrade(t: Trade): number {
  return calcPnl(t);
}

function durationMinutes(t: Trade): number {
  const a = new Date(t.openTime).getTime();
  const b = new Date(t.closeTime).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return (b - a) / 60000;
}

export function computeMetrics(trades: Trade[]): Metrics {
  const tradeCount = trades.length;
  if (tradeCount === 0) {
    return {
      tradeCount: 0,
      winRate: 0,
      totalPnl: 0,
      totalFees: 0,
      grossPnl: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      avgDurationMinutes: 0,
      longCount: 0,
      shortCount: 0,
      longShortRatio: 0,
    };
  }

  const pnls = trades.map(calcPnl);
  const fees = trades.reduce((s, t) => s + (t.fees ?? 0), 0);

  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);

  const totalPnl = pnls.reduce((s, p) => s + p, 0);
  const grossPnl = totalPnl + fees;

  const winRate = wins.length / tradeCount;
  const avgWin = wins.length ? wins.reduce((s, p) => s + p, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, p) => s + p, 0) / losses.length : 0;

  const largestWin = wins.length ? Math.max(...wins) : 0;
  const largestLoss = losses.length ? Math.min(...losses) : 0;

  const avgDurationMinutes =
    trades.reduce((s, t) => s + durationMinutes(t), 0) / tradeCount;

  const longCount = trades.filter((t) => t.side === "LONG").length;
  const shortCount = trades.filter((t) => t.side === "SHORT").length;
  const longShortRatio = shortCount === 0 ? Infinity : longCount / shortCount;

  return {
    tradeCount,
    winRate,
    totalPnl,
    totalFees: fees,
    grossPnl,
    avgWin,
    avgLoss,
    largestWin,
    largestLoss,
    avgDurationMinutes,
    longCount,
    shortCount,
    longShortRatio,
  };
}
