import type { Trade } from "./types";
import { pnlForTrade } from "./metrics";

export type EquityPoint = {
  t: string;        // time (ISO)
  pnl: number;      // trade pnl
  equity: number;   // cumulative pnl
  peak: number;     // rolling peak
  drawdown: number; // equity - peak (<= 0)
};

export function buildEquityCurve(trades: Trade[]): EquityPoint[] {
  // sort by close time (or open time fallback)
  const sorted = [...trades].sort((a, b) => {
    const ta = new Date(a.closeTime || a.openTime).getTime();
    const tb = new Date(b.closeTime || b.openTime).getTime();
    return ta - tb;
  });

  let equity = 0;
  let peak = 0;

  return sorted.map((tr) => {
    const pnl = pnlForTrade(tr);
    equity += pnl;
    peak = Math.max(peak, equity);
    const drawdown = equity - peak;

    return {
      t: tr.closeTime || tr.openTime,
      pnl,
      equity,
      peak,
      drawdown,
    };
  });
}
