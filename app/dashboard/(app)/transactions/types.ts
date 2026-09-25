export interface EntryRow {
  id: string;
  amountCents: number;
  date: string;
  note: string | null;
  source: string;
  category: { id: string; name: string; type: "IN" | "OUT" } | null;
}

export interface CategoryOption {
  id: string;
  name: string;
  type: "IN" | "OUT";
}