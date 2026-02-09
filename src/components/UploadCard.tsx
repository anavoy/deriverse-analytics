import { useState } from "react";
import { parseTradesCsv } from "@/lib/csv";
import type { Trade } from "@/lib/types";

export default function UploadCard({
  onUpload,
}: {
  onUpload: (trades: Trade[]) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10">
      <span className="text-sm">
        {fileName ? `Uploaded: ${fileName}` : "Upload CSV"}
      </span>

      <input
        type="file"
        accept=".csv"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const trades = await parseTradesCsv(file);
          onUpload(trades);
          setFileName(file.name); // 👈 OVO menja UI
        }}
      />
    </label>
  );
}
