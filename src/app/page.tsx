"use client";
import { useState, useMemo } from "react";
import type { Trade } from "@/lib/types";
import { computeMetrics } from "@/lib/metrics";
import { applyFilters, type Filters } from "@/lib/filter";



import UploadCard from "@/components/UploadCard";
import FiltersBar from "@/components/FiltersBar";
import MetricsGrid from "@/components/MetricsGrid";
import EquityChart from "@/components/EquityChart";
import PnlByDayChart from "@/components/PnlByDayChart";
import PnlByHourChart from "@/components/PnlByHourChart";
import LeaderboardTable from "@/components/LeaderboardTable";
import OrderTypeTable from "@/components/OrderTypeTable";
import JournalDrawer from "@/components/JournalDrawer";
import DownloadButtons from "@/components/DownloadButtons";

export default function DashboardLayoutSkeleton() {
  const [trades, setTrades] = useState<Trade[]>([]);


  const [filters, setFilters] = useState<Filters>({
  symbol: "ALL",
  from: "",
  to: "",
});

const filteredTrades = useMemo(
  () => applyFilters(trades, filters),
  [trades, filters]
);

  const metrics = useMemo(() => {
    return computeMetrics(filteredTrades);
  }, [filteredTrades]);


const handleSymbolClick = (symbol: string) => {
  setFilters((f) => ({ ...f, symbol }));
};



  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-[-120px] top-[240px] h-[420px] w-[420px] rounded-full bg-white/4 blur-3xl" />
      </div>

      {/* page container */}
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* top bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Deriverse Trading Analytics
            </h1>
            <p className="text-sm text-neutral-400">
              Upload CSV → filter → analyze PnL, equity, drawdowns, performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DownloadButtons trades={filteredTrades} />

            <JournalDrawer trades={filteredTrades}
 />

          </div>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Upload */}
          <section className="col-span-12 lg:col-span-4">
            <Card title="Upload trades" subtitle="CSV import">
              <UploadCard onUpload={setTrades} />

            </Card>
          </section>

          {/* Filters */}
          <section className="col-span-12 lg:col-span-8">
            <Card title="Filters" subtitle="Symbol + date range">
              <FiltersBar
            trades={trades}
            filters={filters}
            onChange={setFilters}
          />

            </Card>
          </section>

          {/* KPIs */}
          <section className="col-span-12">
            <Card
              title="Key metrics"
              subtitle="Win rate, total PnL, fees, avg win/loss, duration…"
              noPadding
            >
              <div className="p-4">
                <MetricsGrid metrics={metrics} />

              </div>
            </Card>
          </section>

          {/* Equity big */}
          <section className="col-span-12">
            <Card
              title="Equity curve"
              subtitle="Cumulative PnL + peak + drawdown"
              noPadding
            >
              <div className="h-[320px] p-2 sm:h-[380px] sm:p-4">
               <EquityChart trades={filteredTrades}
 />

              </div>
            </Card>
          </section>

          {/* Two small charts */}
          <section className="col-span-12 lg:col-span-6">
            <Card title="PnL by day" subtitle="Daily aggregation" noPadding>
              <div className="h-[260px] p-2 sm:h-[300px] sm:p-4">
                <PnlByDayChart trades={filteredTrades}
 />

              </div>
            </Card>
          </section>

          <section className="col-span-12 lg:col-span-6">
            <Card title="PnL by hour (UTC)" subtitle="Hourly aggregation" noPadding>
              <div className="h-[260px] p-2 sm:h-[300px] sm:p-4">
               <PnlByHourChart trades={filteredTrades}
 />

              </div>
            </Card>
          </section>

          {/* Tables */}
          <section className="col-span-12 lg:col-span-7">
            <Card title="Symbol leaderboard" subtitle="Total PnL, win rate, avg PnL">
             <LeaderboardTable
  trades={filteredTrades}
  onSymbolClick={handleSymbolClick}
/>


            </Card>
          </section>

          <section className="col-span-12 lg:col-span-5">
            <Card title="Order type performance" subtitle="Market/Limit/unknown…">
             <OrderTypeTable trades={filteredTrades}
 />

            </Card>
          </section>

          {/* Footer note */}
          <section className="col-span-12">
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-300 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Tip: Use filters to isolate symbols & date ranges before drawing conclusions.
              </span>
              <span className="text-neutral-500">
                v0.1 • local-only • no backend
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Minimal “premium” card wrapper */
function Card({
  title,
  subtitle,
  children,
  noPadding,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <div className="text-sm font-medium">{title}</div>
          {subtitle ? (
            <div className="text-xs text-neutral-400">{subtitle}</div>
          ) : null}
        </div>

        {/* slot for small actions if needed */}
        <div className="text-xs text-neutral-500" />
      </div>

      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </div>
  );
}
