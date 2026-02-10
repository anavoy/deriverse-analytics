"use client";

import { useState, useMemo } from "react";
import type { Trade } from "@/lib/types";
import { computeMetrics } from "@/lib/metrics";
import { applyFilters, type Filters } from "@/lib/filter";
import {
  buildEquityWithDrawdown,
  maxDrawdown,
} from "@/lib/drawdown";
import { pnlByHour, worstTradingHour } from "@/lib/time_agg";

import UploadCard from "@/components/UploadCard";
import FiltersBar from "@/components/FiltersBar";
import MetricsGrid from "@/components/MetricsGrid";
import EquityChart from "@/components/EquityChart";
import DrawdownChart from "@/components/DrawdownChart";
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

  const metrics = useMemo(
    () => computeMetrics(filteredTrades),
    [filteredTrades]
  );

  const equityWithDrawdown = useMemo(
    () => buildEquityWithDrawdown(filteredTrades),
    [filteredTrades]
  );

  const maxDD = useMemo(
    () => maxDrawdown(equityWithDrawdown),
    [equityWithDrawdown]
  );

  // 🆕 WORST TRADING HOUR
  const pnlHourPoints = useMemo(
    () => pnlByHour(filteredTrades),
    [filteredTrades]
  );

  const worstHour = useMemo(
    () => worstTradingHour(pnlHourPoints),
    [pnlHourPoints]
  );

  const handleSymbolClick = (symbol: string) => {
    setFilters((f) => ({ ...f, symbol }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">
              Deriverse Trading Analytics
            </h1>
            <p className="text-sm text-neutral-400">
              Upload CSV → filter → analyze PnL, equity, drawdowns, performance.
            </p>
          </div>

          <div className="flex gap-2">
            <DownloadButtons trades={filteredTrades} />
            <JournalDrawer trades={filteredTrades} />
          </div>
        </div>

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
              subtitle="Performance, risk & behavioral insights"
              noPadding
            >
              <div className="p-4">
                <MetricsGrid
                  metrics={metrics}
                  maxDrawdown={maxDD}
                  worstHour={worstHour}
                />
              </div>
            </Card>
          </section>

          {/* Equity + Drawdown */}
          <section className="col-span-12">
            <Card title="Equity curve" subtitle="Cumulative PnL & drawdown" noPadding>
              <div className="h-[420px] flex flex-col">
                <div className="flex-1">
                  <EquityChart trades={filteredTrades} />
                </div>
                <div className="h-[120px] mt-2">
                  <DrawdownChart data={equityWithDrawdown} />
                </div>
              </div>
            </Card>
          </section>

          {/* Charts */}
          <section className="col-span-12 lg:col-span-6">
            <Card title="PnL by day" subtitle="Daily aggregation" noPadding>
              <div className="h-[300px] p-4">
                <PnlByDayChart trades={filteredTrades} />
              </div>
            </Card>
          </section>

          <section className="col-span-12 lg:col-span-6">
            <Card title="PnL by hour (UTC)" subtitle="Hourly aggregation" noPadding>
              <div className="h-[300px] p-4">
                <PnlByHourChart trades={filteredTrades} />
              </div>
            </Card>
          </section>

          {/* Tables */}
          <section className="col-span-12 lg:col-span-7">
            <Card title="Symbol leaderboard">
              <LeaderboardTable
                trades={filteredTrades}
                onSymbolClick={handleSymbolClick}
              />
            </Card>
          </section>

          <section className="col-span-12 lg:col-span-5">
            <Card title="Order type performance">
              <OrderTypeTable trades={filteredTrades} />
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="text-sm font-medium">{title}</div>
        {subtitle && (
          <div className="text-xs text-neutral-400">{subtitle}</div>
        )}
      </div>
      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </div>
  );
}
