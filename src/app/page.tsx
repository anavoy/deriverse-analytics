"use client";
import { useEffect, useMemo, useState } from "react";
import { parseTradesCsv } from "@/lib/csv";
import type { Trade } from "@/lib/types";
import { computeMetrics, pnlForTrade } from "@/lib/metrics";
import { buildEquityCurve } from "@/lib/equity";
import { applyFilters } from "@/lib/filter";
import { pnlByDay, pnlByHour } from "@/lib/time_agg";
import { orderTypePerformance, symbolLeaderboard } from "@/lib/leaderboards";
import { loadJournal, saveJournal, type TradeNote } from "@/lib/journal";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Home() {
  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [symbol, setSymbol] = useState<string>("ALL");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // Journal state
  const [journal, setJournal] = useState<Record<string, TradeNote>>({});
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

  useEffect(() => {
    setJournal(loadJournal());
  }, []);

  const selectedTrade = useMemo(() => {
    if (!selectedTradeId || !trades) return null;
    return trades.find((t) => t.tradeId === selectedTradeId) ?? null;
  }, [selectedTradeId, trades]);

  const selectedNote = useMemo(() => {
    if (!selectedTradeId) return { note: "", tags: [] as string[] };
    const existing = journal[selectedTradeId];
    return existing
      ? { note: existing.note ?? "", tags: existing.tags ?? [] }
      : { note: "", tags: [] as string[] };
  }, [journal, selectedTradeId]);

  const symbols = useMemo(() => {
    const s = new Set<string>();
    (trades ?? []).forEach((t) => s.add(t.symbol));
    return ["ALL", ...Array.from(s).sort()];
  }, [trades]);

  const filteredTrades = useMemo(() => {
    if (!trades) return null;
    return applyFilters(trades, { symbol, from, to });
  }, [trades, symbol, from, to]);

  const preview = useMemo(
    () => (filteredTrades ? filteredTrades.slice(0, 10) : []),
    [filteredTrades]
  );

  const metrics = useMemo(
    () => (filteredTrades ? computeMetrics(filteredTrades) : null),
    [filteredTrades]
  );

  const equity = useMemo(
    () => (filteredTrades ? buildEquityCurve(filteredTrades) : []),
    [filteredTrades]
  );

  const byDay = useMemo(
    () => (filteredTrades ? pnlByDay(filteredTrades) : []),
    [filteredTrades]
  );

  const byHour = useMemo(
    () => (filteredTrades ? pnlByHour(filteredTrades) : []),
    [filteredTrades]
  );

  const symbolPerf = useMemo(
    () => (filteredTrades ? symbolLeaderboard(filteredTrades) : []),
    [filteredTrades]
  );

  const orderPerf = useMemo(
    () => (filteredTrades ? orderTypePerformance(filteredTrades) : []),
    [filteredTrades]
  );

  const bestSymbols = useMemo(() => symbolPerf.slice(0, 5), [symbolPerf]);
  const worstSymbols = useMemo(() => symbolPerf.slice(-5).reverse(), [symbolPerf]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseTradesCsv(file);
      setTrades(parsed);

      // Reset filters on new upload
      setSymbol("ALL");
      setFrom("");
      setTo("");

      // close panel
      setSelectedTradeId(null);
    } catch (err: any) {
      setTrades(null);
      setError(err?.message ?? "Failed to parse CSV");
      setSelectedTradeId(null);
    }
  }

  function updateJournal(tradeId: string, patch: { note?: string; tags?: string[] }) {
    setJournal((prev) => {
      const next: Record<string, TradeNote> = { ...prev };
      const current = next[tradeId] ?? { note: "", tags: [], updatedAt: new Date().toISOString() };

      const updated: TradeNote = {
        note: patch.note ?? current.note,
        tags: patch.tags ?? current.tags,
        updatedAt: new Date().toISOString(),
      };

      next[tradeId] = updated;
      saveJournal(next);
      return next;
    });
  }

  function clearJournal(tradeId: string) {
    setJournal((prev) => {
      const next = { ...prev };
      delete next[tradeId];
      saveJournal(next);
      return next;
    });
  }

  const isPanelOpen = !!selectedTradeId;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Deriverse Trading Analytics</h1>
          <p className="text-neutral-600">
            Upload your trades CSV to calculate PnL, fees, win rate, drawdown, and journal insights.
          </p>
        </header>

        {/* Upload */}
        <section className="rounded-2xl border p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={onFileChange}
              className="block w-full text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {trades && (
            <p className="text-sm text-neutral-600">
              Parsed <span className="font-medium">{trades.length}</span> trades.
            </p>
          )}
        </section>

        {/* Filters */}
        {trades && (
          <section className="rounded-2xl border p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Symbol</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                >
                  {symbols.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-600 mb-1">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-600 mb-1">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <span>
                Showing <span className="font-medium">{filteredTrades?.length ?? 0}</span> trades
              </span>
              <button
                onClick={() => {
                  setSymbol("ALL");
                  setFrom("");
                  setTo("");
                }}
                className="rounded-lg border px-3 py-1 hover:bg-neutral-50"
              >
                Reset
              </button>
            </div>
          </section>
        )}

        {/* KPI Cards */}
        {metrics && (
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-4 shadow-sm">
              <p className="text-sm text-neutral-600">Total PnL</p>
              <p className="text-2xl font-semibold">{metrics.totalPnl.toFixed(2)}</p>
              <p className="text-xs text-neutral-500 mt-1">Gross: {metrics.grossPnl.toFixed(2)}</p>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              <p className="text-sm text-neutral-600">Win rate</p>
              <p className="text-2xl font-semibold">{(metrics.winRate * 100).toFixed(1)}%</p>
              <p className="text-xs text-neutral-500 mt-1">Trades: {metrics.tradeCount}</p>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              <p className="text-sm text-neutral-600">Fees</p>
              <p className="text-2xl font-semibold">{metrics.totalFees.toFixed(2)}</p>
              <p className="text-xs text-neutral-500 mt-1">
                Fees impact:{" "}
                {metrics.grossPnl !== 0
                  ? ((metrics.totalFees / Math.abs(metrics.grossPnl)) * 100).toFixed(1)
                  : "0"}
                %
              </p>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              <p className="text-sm text-neutral-600">Avg win / Avg loss</p>
              <p className="text-2xl font-semibold">
                {metrics.avgWin.toFixed(2)} / {metrics.avgLoss.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              <p className="text-sm text-neutral-600">Largest win / loss</p>
              <p className="text-2xl font-semibold">
                {metrics.largestWin.toFixed(2)} / {metrics.largestLoss.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              <p className="text-sm text-neutral-600">Avg duration</p>
              <p className="text-2xl font-semibold">{metrics.avgDurationMinutes.toFixed(1)} min</p>
              <p className="text-xs text-neutral-500 mt-1">
                Long/Short: {metrics.longCount}/{metrics.shortCount}{" "}
                {Number.isFinite(metrics.longShortRatio)
                  ? `(${metrics.longShortRatio.toFixed(2)})`
                  : "(∞)"}
              </p>
            </div>
          </section>
        )}

        {/* Equity + Drawdown */}
        {filteredTrades && filteredTrades.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-4 shadow-sm">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">
                Equity Curve (Cumulative PnL)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="t"
                      tickFormatter={(v) => new Date(v).toLocaleDateString()}
                      minTickGap={24}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(v) => new Date(String(v)).toLocaleString()}
                      formatter={(val: any) => [Number(val).toFixed(2), "equity"]}
                    />
                    <Line type="monotone" dataKey="equity" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Drawdown</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="t"
                      tickFormatter={(v) => new Date(v).toLocaleDateString()}
                      minTickGap={24}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(v) => new Date(String(v)).toLocaleString()}
                      formatter={(val: any) => [Number(val).toFixed(2), "drawdown"]}
                    />
                    <Line type="monotone" dataKey="drawdown" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Drawdown is equity minus the running peak (always ≤ 0).
              </p>
            </div>
          </section>
        )}

        {/* PnL by Day + Hour */}
        {filteredTrades && filteredTrades.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-4 shadow-sm">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">PnL by Day</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(val: any) => [Number(val).toFixed(2), "pnl"]} />
                    <Line type="monotone" dataKey="pnl" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">PnL by Hour (UTC)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={byHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(val: any) => [Number(val).toFixed(2), "pnl"]} />
                    <Line type="monotone" dataKey="pnl" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-neutral-500">Hour is based on close time in UTC.</p>
            </div>
          </section>
        )}

        {/* Best/Worst + Order type */}
        {filteredTrades && filteredTrades.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-4 shadow-sm">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Best / Worst Symbols</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Top 5 (by Total PnL)</p>
                  <div className="space-y-2">
                    {bestSymbols.map((s) => (
                      <div key={"best-" + s.symbol} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{s.symbol}</span>
                        <span>{s.totalPnl.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-neutral-500 mb-2">Bottom 5 (by Total PnL)</p>
                  <div className="space-y-2">
                    {worstSymbols.map((s) => (
                      <div key={"worst-" + s.symbol} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{s.symbol}</span>
                        <span>{s.totalPnl.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Order Type Performance</h3>

              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-neutral-600">
                    <tr className="border-b">
                      <th className="py-2 pr-3">Order type</th>
                      <th className="py-2 pr-3">Trades</th>
                      <th className="py-2 pr-3">Win rate</th>
                      <th className="py-2 pr-3">Total PnL</th>
                      <th className="py-2 pr-3">Avg PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderPerf.map((o) => (
                      <tr key={o.orderType} className="border-b last:border-0">
                        <td className="py-2 pr-3 font-medium">{o.orderType}</td>
                        <td className="py-2 pr-3">{o.trades}</td>
                        <td className="py-2 pr-3">{(o.winRate * 100).toFixed(1)}%</td>
                        <td className="py-2 pr-3">{o.totalPnl.toFixed(2)}</td>
                        <td className="py-2 pr-3">{o.avgPnl.toFixed(2)}</td>
                      </tr>
                    ))}
                    {orderPerf.length === 0 && (
                      <tr>
                        <td className="py-2 text-neutral-500" colSpan={5}>
                          No order type data (missing order_type column).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                Uses <span className="font-medium">order_type</span> from CSV (fallback: "unknown").
              </p>
            </div>
          </section>
        )}

        {/* Preview Table (click row to open Journal) */}
        {filteredTrades && (
          <section className="rounded-2xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Preview (first 10 rows)</h2>
              <p className="text-xs text-neutral-500">Click a row to add journal notes.</p>
            </div>

            <div className="overflow-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="text-left text-neutral-600">
                  <tr className="border-b">
                    <th className="py-2 pr-4">tradeId</th>
                    <th className="py-2 pr-4">symbol</th>
                    <th className="py-2 pr-4">side</th>
                    <th className="py-2 pr-4">openTime</th>
                    <th className="py-2 pr-4">closeTime</th>
                    <th className="py-2 pr-4">entry</th>
                    <th className="py-2 pr-4">exit</th>
                    <th className="py-2 pr-4">size</th>
                    <th className="py-2 pr-4">fees</th>
                    <th className="py-2 pr-4">pnl</th>
                    <th className="py-2 pr-4">note</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((t) => {
                    const hasNote = !!journal[t.tradeId]?.note || (journal[t.tradeId]?.tags?.length ?? 0) > 0;
                    return (
                      <tr
                        key={t.tradeId}
                        onClick={() => setSelectedTradeId(t.tradeId)}
                        className="border-b last:border-0 cursor-pointer hover:bg-neutral-50"
                      >
                        <td className="py-2 pr-4 whitespace-nowrap">{t.tradeId}</td>
                        <td className="py-2 pr-4 whitespace-nowrap">{t.symbol}</td>
                        <td className="py-2 pr-4">{t.side}</td>
                        <td className="py-2 pr-4 whitespace-nowrap">{t.openTime}</td>
                        <td className="py-2 pr-4 whitespace-nowrap">{t.closeTime}</td>
                        <td className="py-2 pr-4">{t.entryPrice}</td>
                        <td className="py-2 pr-4">{t.exitPrice}</td>
                        <td className="py-2 pr-4">{t.size}</td>
                        <td className="py-2 pr-4">{t.fees}</td>
                        <td className="py-2 pr-4">{pnlForTrade(t).toFixed(2)}</td>
                        <td className="py-2 pr-4 text-xs text-neutral-500">
                          {hasNote ? "✓" : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Side panel + overlay */}
      {isPanelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSelectedTradeId(null)}
          />
          <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l shadow-xl p-5 overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Trade Journal</h3>
              <button
                onClick={() => setSelectedTradeId(null)}
                className="rounded-lg border px-3 py-1 hover:bg-neutral-50"
              >
                Close
              </button>
            </div>

            {!selectedTrade ? (
              <p className="mt-4 text-sm text-neutral-600">Trade not found.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-600">Trade</p>
                    <span className="text-xs text-neutral-500">{selectedTrade.tradeId}</span>
                  </div>

                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Symbol</span>
                      <span className="font-medium">{selectedTrade.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Side</span>
                      <span className="font-medium">{selectedTrade.side}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">PnL</span>
                      <span className="font-medium">{pnlForTrade(selectedTrade).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Open</span>
                      <span className="font-medium">{selectedTrade.openTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Close</span>
                      <span className="font-medium">{selectedTrade.closeTime}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Tags (comma separated)</label>
                  <input
                    value={selectedNote.tags.join(", ")}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean);
                      updateJournal(selectedTrade.tradeId, { tags });
                    }}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    placeholder="breakout, revenge, fomo"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Note</label>
                  <textarea
                    value={selectedNote.note}
                    onChange={(e) => updateJournal(selectedTrade.tradeId, { note: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm min-h-[140px]"
                    placeholder="What went well? What went wrong? What will you do next time?"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    Saved locally (localStorage).{" "}
                    {journal[selectedTrade.tradeId]?.updatedAt
                      ? `Updated: ${new Date(journal[selectedTrade.tradeId].updatedAt).toLocaleString()}`
                      : ""}
                  </p>

                  <button
                    onClick={() => clearJournal(selectedTrade.tradeId)}
                    className="rounded-lg border px-3 py-1 hover:bg-neutral-50 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </aside>
        </>
      )}
    </main>
  );
}
