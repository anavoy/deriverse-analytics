import type { Trade } from "./types";
import { pnlForTrade } from "./metrics";

export type DayPoint = { day: string; pnl: number };
export type HourPoint = { hour: number; pnl: number };

function tradeTimeMs(t: Trade) {
  const ms = new Date(t.closeTime || t.openTime).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export function pnlByDay(trades: Trade[]): DayPoint[] {
  const map = new Map<string, number>();
  for (const t of trades) {
    const d = new Date(tradeTimeMs(t));
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    map.set(key, (map.get(key) ?? 0) + pnlForTrade(t));
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, pnl]) => ({ day, pnl }));
}

export function pnlByHour(trades: Trade[]): HourPoint[] {
  const map = new Map<number, number>();
  for (let h = 0; h < 24; h++) map.set(h, 0);

  for (const t of trades) {
    const d = new Date(tradeTimeMs(t));
    const hour = d.getUTCHours(); // UTC hour
    map.set(hour, (map.get(hour) ?? 0) + pnlForTrade(t));
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([hour, pnl]) => ({ hour, pnl }));
}
