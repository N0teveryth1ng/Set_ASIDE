"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseEntryInput } from "@/lib/entry-input";
import type { EntryRow, CategoryOption } from "./types";

interface Draft {
  amount: string;
  date: string;
  note: string;
  categoryId: string;
}

const EMPTY_DRAFT: Draft = { amount: "", date: "", note: "", categoryId: "" };

interface AmountStyle {
  text: string;
  cls: string;
}

function amountStyle(entry: EntryRow, currency: string): AmountStyle {
  const code = currency || "USD";
  const abs = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    currencyDisplay: "narrowSymbol",
  }).format(Math.abs(entry.amountCents) / 100);
  if (!entry.category) return { text: abs, cls: "text-gray-600" };
  if (entry.category.type === "IN") return { text: `+${abs}`, cls: "text-emerald-600" };
  return { text: `\u2212${abs}`, cls: "text-red-600" };
}

function toDraft(entry: EntryRow): Draft {
  return {
    amount: String(entry.amountCents),
    date: entry.date,
    note: entry.note ?? "",
    categoryId: entry.category?.id ?? "",
  };
}

function draftToInput(draft: Draft) {
  return parseEntryInput({
    amountCents: Number(draft.amount),
    date: draft.date,
    note: draft.note,
    categoryId: draft.categoryId || null,
  });
}

const inputCls =
  "w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none";
const btnPrimary =
  "rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-60";
const btnGhost =
  "rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50";

export function TransactionsView({
  entries,
  categories,
  currency,
}: {
  entries: EntryRow[];
  categories: CategoryOption[];
  currency: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function request(method: string, url: string, body?: unknown): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok || data.error) {
        setError(data.error ?? `Request failed (${res.status})`);
        return false;
      }
      return true;
    } catch {
      setError("Could not reach the server. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function afterMutation() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    router.refresh();
  }

  async function create() {
    const parsed = draftToInput(draft);
    if (!parsed.ok) {
      setError(parsed.errors.join("; "));
      return;
    }
    if (await request("POST", "/api/entries", parsed.value)) afterMutation();
  }

  async function saveEdit() {
    const parsed = draftToInput(editDraft);
    if (!parsed.ok) {
      setError(parsed.errors.join("; "));
      return;
    }
    if (editingId && (await request("PATCH", `/api/entries/${editingId}`, parsed.value))) {
      afterMutation();
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this entry?")) return;
    if (await request("DELETE", `/api/entries/${id}`)) afterMutation();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
        <p className="text-sm text-gray-500">
          {entries.length} entr{entries.length === 1 ? "y" : "ies"} · amounts in whole
          cents ($1.00 = 100)
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mb-8 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="Amount (cents)"
            value={draft.amount}
            onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
            className={inputCls}
          />
          <input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
            className={inputCls}
          />
          <select
            value={draft.categoryId}
            onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
            className={inputCls}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.type === "IN" ? "+" : "\u2212"} {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            maxLength={500}
            placeholder="Note"
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            className={inputCls}
          />
          <button type="button" onClick={create} disabled={busy} className={`${btnPrimary} sm:col-span-1`}>
            Add entry
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-gray-600">
            No entries yet — add your first entry above.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => {
                const { text, cls } = amountStyle(entry, currency);
                if (editingId === entry.id) {
                  return (
                    <tr key={entry.id} className="bg-amber-50/40">
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={editDraft.date}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, date: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={editDraft.categoryId}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, categoryId: e.target.value }))
                          }
                          className={inputCls}
                        >
                          <option value="">Uncategorized</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.type === "IN" ? "+" : "\u2212"} {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          maxLength={500}
                          value={editDraft.note}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, note: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          step="1"
                          value={editDraft.amount}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, amount: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={busy}
                            className={`${btnPrimary} !px-3 !py-1`}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className={btnGhost}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={entry.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{entry.date}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {entry.category ? entry.category.name : "Uncategorized"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{entry.note ?? ""}</td>
                    <td className={`px-4 py-3 text-right font-medium tabular-nums ${cls}`}>
                      {text}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(entry.id);
                            setEditDraft(toDraft(entry));
                          }}
                          className={btnGhost}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(entry.id)}
                          className={`${btnGhost} text-red-600 hover:bg-red-50`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}