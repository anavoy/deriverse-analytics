import Papa from "papaparse";
import { Trade, Side } from "./types";

function pick(obj: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") return obj[k];
  }
  return undefined;
}

function toNumber(v: any, fallback = 0) {
  const n = Number(String(v).replaceAll(",", "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSide(v: any): Side {
  const s = String(v ?? "").toUpperCase().trim();
  if (s === "BUY" || s === "LONG") return "LONG";
  if (s === "SELL" || s === "SHORT") return "SHORT";
  return "LONG";
}

function toIso(v: any) {
  const s = String(v ?? "").trim();
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  // fallback: keep raw (you can improve later)
  return s;
}

export function parseTradesCsv(file: File): Promise<Trade[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data ?? [];
          const trades: Trade[] = rows
            .filter((r) => Object.keys(r).length > 0)
            .map((r, idx) => {
              const tradeId =
                String(pick(r, ["trade_id", "tradeId", "id", "uuid"]) ?? `row-${idx + 1}`);

              const symbol = String(pick(r, ["symbol", "market", "pair", "instrument"]) ?? "UNKNOWN");

              const side = normalizeSide(pick(r, ["side", "direction", "type"]));

              const openTime = toIso(pick(r, ["open_time", "openTime", "entry_time", "timestamp_open", "opened_at"]));
              const closeTime = toIso(pick(r, ["close_time", "closeTime", "exit_time", "timestamp_close", "closed_at"]));

              const entryPrice = toNumber(pick(r, ["entry_price", "entryPrice", "open_price", "price_entry"]));
              const exitPrice = toNumber(pick(r, ["exit_price", "exitPrice", "close_price", "price_exit"]));

              const size = toNumber(pick(r, ["size", "qty", "quantity", "amount"]));
              const fees = toNumber(pick(r, ["fees", "fee", "total_fees", "commission"]), 0);

              const orderType = pick(r, ["order_type", "orderType", "type_order"]);

              const realizedPnlRaw = pick(r, ["realized_pnl", "pnl", "profit", "realizedPnl"]);
              const realizedPnl = realizedPnlRaw !== undefined ? toNumber(realizedPnlRaw) : undefined;

              return {
                tradeId,
                symbol,
                side,
                openTime,
                closeTime,
                entryPrice,
                exitPrice,
                size,
                fees,
                orderType: orderType ? String(orderType) : undefined,
                realizedPnl,
              };
            });

          resolve(trades);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}
