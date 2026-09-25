"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseEntryInput } from "@/lib/entry-input";
import type { EntryRow, CategoryOption } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { palette, recipe, type } from "@/lib/tokens";

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
  if (!entry.category) return { text: abs, cls: palette.textSubtle };
  if (entry.category.type === "IN") return { text: `+${abs}`, cls: palette.gainText };
  return { text: `\u2212${abs}`, cls: palette.lossText };
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

function CategorySelect({
  value,
  categories,
  onValueChange,
  ariaLabel,
}: {
  value: string;
  categories: CategoryOption[];
  onValueChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={ariaLabel} className="w-full">
        <SelectValue placeholder="Uncategorized" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Uncategorized</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.type === "IN" ? "+" : "\u2212"} {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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
      <div className="mb-8">
        <h2 className={type.pageTitle + " " + palette.text}>Transactions</h2>
        <p className={`mt-1 ${type.text} ${palette.textFaint}`}>
          {entries.length} entr{entries.length === 1 ? "y" : "ies"} · amounts in whole
          cents ($1.00 = 100)
        </p>
      </div>

      {error && <p className={`${recipe.errorBoxLg} mb-4`}>{error}</p>}

      <div className={`${recipe.surface} mb-10 p-5`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="Amount (cents)"
            value={draft.amount}
            onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
            aria-label="Amount in cents"
          />
          <Input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
            aria-label="Date"
          />
          <CategorySelect
            value={draft.categoryId}
            categories={categories}
            onValueChange={(categoryId) => setDraft((d) => ({ ...d, categoryId }))}
            ariaLabel="Category"
          />
          <Input
            type="text"
            maxLength={500}
            placeholder="Note"
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            aria-label="Note"
          />
          <Button type="button" onClick={create} disabled={busy}>
            Add entry
          </Button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className={`${recipe.surfaceDashed} px-6 py-12 text-center`}>
          <p className={`${type.text} ${palette.textSubtle}`}>
            No entries yet — add your first entry above.
          </p>
        </div>
      ) : (
        <div className={`${recipe.surface} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className={`border-b bg-gray-50 ${type.caps} ${palette.textGhost}`}>
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${palette.divide}`}>
              {entries.map((entry) => {
                const { text, cls } = amountStyle(entry, currency);
                if (editingId === entry.id) {
                  return (
                    <tr key={entry.id} className={palette.warnSoftBg}>
                      <td className="px-4 py-2">
                        <Input
                          type="date"
                          value={editDraft.date}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, date: e.target.value }))
                          }
                          aria-label="Edit date"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <CategorySelect
                          value={editDraft.categoryId}
                          categories={categories}
                          onValueChange={(categoryId) =>
                            setEditDraft((d) => ({ ...d, categoryId }))
                          }
                          ariaLabel="Edit category"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          maxLength={500}
                          value={editDraft.note}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, note: e.target.value }))
                          }
                          aria-label="Edit note"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          step={1}
                          value={editDraft.amount}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, amount: e.target.value }))
                          }
                          aria-label="Edit amount in cents"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            onClick={saveEdit}
                            disabled={busy}
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={entry.id} className={`transition-colors ${palette.surfaceHover}`}>
                    <td className={`px-4 py-3 ${palette.textGhost}`}>{entry.date}</td>
                    <td className={`px-4 py-3 ${palette.text}`}>
                      {entry.category ? entry.category.name : "Uncategorized"}
                    </td>
                    <td className={`px-4 py-3 ${palette.textGhost}`}>{entry.note ?? ""}</td>
                    <td className={`px-4 py-3 text-right font-medium tabular-nums ${cls}`}>
                      {text}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(entry.id);
                            setEditDraft(toDraft(entry));
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => remove(entry.id)}
                        >
                          Delete
                        </Button>
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