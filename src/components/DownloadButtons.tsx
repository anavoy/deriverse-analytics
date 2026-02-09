"use client";

import type { Trade } from "@/lib/types";
import { downloadJson } from "@/lib/export";

export default function DownloadButtons({
  trades,
}: {
  trades: Trade[];
}) {
  return (
    <button
      onClick={() =>
        downloadJson("filtered-trades.json", trades)
      }
      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300 hover:bg-white/10"
    >
      Download
    </button>
  );
}
