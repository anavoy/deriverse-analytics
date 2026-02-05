export type TradeNote = {
  note: string;
  tags: string[];     // ["breakout", "revenge", ...]
  updatedAt: string;  // ISO
};

const KEY = "deriverse_journal_v1";

export function loadJournal(): Record<string, TradeNote> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, TradeNote>;
  } catch {
    return {};
  }
}

export function saveJournal(data: Record<string, TradeNote>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}
