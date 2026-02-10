import type { Metrics } from "@/lib/metrics";

export default function MetricsGrid({
  metrics,
  maxDrawdown,
  worstHour,
}: {
  metrics: Metrics;
  maxDrawdown: number;
  worstHour: { hour: number; pnl: number };
}) {
  const items = [
    { label: "Trades", value: metrics.tradeCount },

    {
      label: "Win rate",
      value: (metrics.winRate * 100).toFixed(1) + "%",
      positive: metrics.winRate >= 0.5,
    },
    {
      label: "Total PnL",
      value: formatPnl(metrics.totalPnl),
      positive: metrics.totalPnl >= 0,
    },

    // 🟥 MAX DD
    {
      label: "Max drawdown",
      value: maxDrawdown.toFixed(2) + "%",
      negative: true,
    },

    // 🟣 INSIGHT
    {
      label: "Worst trading hour (UTC)",
      value: `${worstHour.hour}:00 (${formatPnl(worstHour.pnl)})`,
      negative: true,
    },

    { label: "Fees", value: formatPnl(-metrics.totalFees), muted: true },
    { label: "Avg win", value: formatPnl(metrics.avgWin), positive: true },
    { label: "Avg loss", value: formatPnl(metrics.avgLoss), negative: true },
    {
      label: "Largest win",
      value: formatPnl(metrics.largestWin),
      positive: true,
    },
    {
      label: "Largest loss",
      value: formatPnl(metrics.largestLoss),
      negative: true,
    },
    {
      label: "Long / Short",
      value: `${metrics.longCount} / ${metrics.shortCount}`,
    },
    {
      label: "Long / Short PnL",
      value: `${formatPnl(metrics.longPnl)} / ${formatPnl(metrics.shortPnl)}`,
      positive: metrics.longPnl + metrics.shortPnl >= 0,
      negative: metrics.longPnl + metrics.shortPnl < 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
        >
          <div className="text-xs text-neutral-400">{item.label}</div>
          <div
            className={[
              "mt-1 text-lg font-semibold tabular-nums",
              item.positive ? "text-green-400" : "",
              item.negative ? "text-red-400" : "",
              item.muted ? "text-neutral-300" : "",
            ].join(" ")}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatPnl(v: number) {
  const sign = v > 0 ? "+" : "";
  return sign + v.toFixed(2);
}
