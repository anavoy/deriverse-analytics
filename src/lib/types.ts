export type Side = "LONG" | "SHORT";

export type Trade = {
  tradeId: string;
  symbol: string;
  side: Side;
  openTime: string;  // ISO string
  closeTime: string; // ISO string
  entryPrice: number;
  exitPrice: number;
  size: number;      // qty
  fees: number;      // total fees
  orderType?: string;
  realizedPnl?: number; // optional if provided by CSV
};
