"use client";

import type { Trade } from "@/lib/types";
import type { Filters } from "@/lib/filter";

export default function FiltersBar({
  trades,
  filters,
  onChange,
}: {
  trades: Trade[];
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const symbols = Array.from(
    new Set(trades.map((t) => t.symbol))
  );

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Symbol */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-400">Symbol</label>
        <select
          value={filters.symbol}
          onChange={(e) =>
            onChange({ ...filters, symbol: e.target.value })
          }
          className="rounded-lg bg-white/5 px-3 py-2 text-sm outline-none"
        >
          <option value="ALL">All</option>
          {symbols.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* From */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-400">From</label>
        <input
          type="date"
          value={filters.from}
          onChange={(e) =>
            onChange({ ...filters, from: e.target.value })
          }
          className="rounded-lg bg-white/5 px-3 py-2 text-sm outline-none"
        />
      </div>

      {/* To */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-400">To</label>
        <input
          type="date"
          value={filters.to}
          onChange={(e) =>
            onChange({ ...filters, to: e.target.value })
          }
          className="rounded-lg bg-white/5 px-3 py-2 text-sm outline-none"
        />
      </div>

      {/* Reset */}
      <button
        onClick={() =>
          onChange({ symbol: "ALL", from: "", to: "" })
        }
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 hover:bg-white/10"
      >
        Reset
      </button>
    </div>
  );
}
