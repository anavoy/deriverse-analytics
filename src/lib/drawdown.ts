import type { Trade } from "@/lib/types";

export type EquityPoint = {
  time: string;
  equity: number;
  peak: number;
  drawdown: number;
};

export function buildEquityWithDrawdown(trades: Trade[]): EquityPoint[] {
  let equity = 0;
  let peak = 0;

  return trades
    .slice()
    .sort(
      (a, b) =>
        new Date(a.closeTime).getTime() -
        new Date(b.closeTime).getTime()
    )
    .map((t) => {
      const pnl =
        t.side === "LONG"
          ? (t.exitPrice - t.entryPrice) * t.size - t.fees
          : (t.entryPrice - t.exitPrice) * t.size - t.fees;

      equity += pnl;
      peak = Math.max(peak, equity);

      return {
        time: t.closeTime,
        equity,
        peak,
        drawdown: equity - peak,
      };
    });
}
