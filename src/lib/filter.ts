import type { Trade } from "./types";

export type Filters = {
  symbol: string;      // "ALL" or exact symbol
  from: string;        // "" or yyyy-mm-dd
  to: string;          // "" or yyyy-mm-dd
};

function toMs(dateStr: string, endOfDay = false) {
  if (!dateStr) return null;
  const d = new Date(dateStr + (endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z"));
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function applyFilters(trades: Trade[], f: Filters): Trade[] {
  let out = trades;

  if (f.symbol && f.symbol !== "ALL") {
    out = out.filter((t) => t.symbol === f.symbol);
  }

  const fromMs = toMs(f.from, false);
  const toMsVal = toMs(f.to, true);

  if (fromMs !== null) {
    out = out.filter((t) => new Date(t.closeTime || t.openTime).getTime() >= fromMs);
  }
  if (toMsVal !== null) {
    out = out.filter((t) => new Date(t.closeTime || t.openTime).getTime() <= toMsVal);
  }

  return out;
}
