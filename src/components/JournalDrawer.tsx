"use client";

import { useEffect, useState } from "react";
import type { Trade } from "@/lib/types";
import { loadJournal, saveJournal, type TradeNote } from "@/lib/journal";

export default function JournalDrawer({ trades = [] }: { trades?: Trade[] }) {

  const [open, setOpen] = useState(false);
  const [journal, setJournal] = useState<Record<string, TradeNote>>({});
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    setJournal(loadJournal());
  }, []);

  const saveNote = (tradeId: string, note: TradeNote) => {
    const next = { ...journal, [tradeId]: note };
    setJournal(next);
    saveJournal(next);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300 hover:bg-white/10"
      >
        Journal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* overlay */}
          <div
            className="flex-1 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* drawer */}
          <div className="w-full max-w-md bg-neutral-950 border-l border-white/10 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="font-medium">Trade Journal</div>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* trade list */}
              <div className="w-40 border-r border-white/10 overflow-y-auto">
                {trades.map((t) => (
                  <button
                    key={t.tradeId}
                    onClick={() => setSelectedTrade(t)}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-white/5 ${
                      selectedTrade?.tradeId === t.tradeId
                        ? "bg-white/10"
                        : ""
                    }`}
                  >
                    {t.symbol}
                  </button>
                ))}
              </div>

              {/* editor */}
              <div className="flex-1 p-3">
                {!selectedTrade ? (
                  <div className="text-sm text-neutral-500">
                    Select a trade
                  </div>
                ) : (
                  <JournalEditor
                    trade={selectedTrade}
                    note={journal[selectedTrade.tradeId]}
                    onSave={saveNote}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function JournalEditor({
  trade,
  note,
  onSave,
}: {
  trade: Trade;
  note?: TradeNote;
  onSave: (id: string, note: TradeNote) => void;
}) {
  const [text, setText] = useState(note?.note ?? "");
  const [tags, setTags] = useState(note?.tags.join(", ") ?? "");
  const [saved, setSaved] = useState(false);
  

  useEffect(() => {
    setText(note?.note ?? "");
    setTags(note?.tags.join(", ") ?? "");
  }, [note, trade.tradeId]);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-neutral-400">
        {trade.symbol} • {trade.side}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Trade notes…"
        className="h-32 w-full resize-none rounded-lg bg-white/5 p-2 text-sm outline-none"
      />

      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)"
        className="w-full rounded-lg bg-white/5 p-2 text-sm outline-none"
      />

      <button
  onClick={() => {
    onSave(trade.tradeId, {
      note: text,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }}
  className="self-end rounded-lg bg-green-500 px-3 py-1 text-sm text-black hover:bg-green-400"
>
  {saved ? "Saved ✓" : "Save"}
</button>

    </div>
  );
}
