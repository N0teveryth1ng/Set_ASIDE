"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface TemplateRow {
  id: string;
  amountCents: number;
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
  note: string | null;
  active: boolean;
  categoryId: string | null;
  category: { name: string; type: "IN" | "OUT" } | null;
}

export interface CategoryRow {
  id: string;
  name: string;
  type: "IN" | "OUT";
}

interface TemplateResponse {
  template: TemplateRow;
}
interface GenerateResponse {
  created: number;
  skipped: number;
}

const inputCls =
  "w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none";
const labelCls = "block text-sm font-medium text-gray-700";
const btnPrimary =
  "rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-60";
const btnGhost =
  "rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50";

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function RecurringView({
  templates: initialTemplates,
  categories,
}: {
  templates: TemplateRow[];
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateRow[]>(initialTemplates);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genResult, setGenResult] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState("");
  const [newDay, setNewDay] = useState("1");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newActive, setNewActive] = useState(true);

  async function request<T>(method: string, url: string, body?: unknown): Promise<T | null> {
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
        return null;
      }
      return data as T;
    } catch {
      setError("Could not reach the server. Please try again.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  function replaceTemplate(template: TemplateRow) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === template.id ? template : t)),
    );
  }

  async function createTemplate() {
    const amount = Number(newAmount);
    const day = Number(newDay);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Enter an amount in whole cents (e.g. 2500 = $25.00).");
      return;
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      setError("Enter a day of the month between 1 and 31.");
      return;
    }
    if (!newStart) {
      setError("Pick a start date.");
      return;
    }
    const data = await request<TemplateResponse>("POST", "/api/templates", {
      amountCents: amount,
      dayOfMonth: day,
      startDate: newStart,
      endDate: newEnd ? newEnd : null,
      note: newNote.trim() ? newNote.trim() : null,
      categoryId: newCategory || null,
      active: newActive,
    });
    if (data) {
      setNewAmount("");
      setNewDay("1");
      setNewStart("");
      setNewEnd("");
      setNewCategory("");
      setNewNote("");
      setNewActive(true);
      router.refresh();
    }
  }

  async function patchTemplate(id: string, next: Partial<TemplateRow>) {
    const data = await request<TemplateResponse>("PATCH", `/api/templates/${id}`, next);
    if (data) replaceTemplate(data.template);
  }

  async function deleteTemplate(id: string) {
    const data = await request<Record<string, never>>("DELETE", `/api/templates/${id}`);
    if (data !== null) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  }

  async function generate() {
    setGenResult(null);
    const data = await request<GenerateResponse>("POST", "/api/templates/generate", {});
    if (data) {
      setGenResult(
        data.created > 0
          ? `Created ${data.created} recurring entr${data.created === 1 ? "y" : "ies"}${
              data.skipped > 0 ? `, skipped ${data.skipped} already covered` : ""
            }.`
          : "Nothing new to create. All due recurring entries are already in your ledger.",
      );
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Recurring entries</h2>
        <p className="text-sm text-gray-500">
          Set amounts that repeat every month (subscriptions, fixed bills,
          recurring income). Generating creates one entry per calendar month,
          clamping overflow days like Jan 31 to the last day of the month.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Section title="New recurring entry">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className={labelCls} htmlFor="new-amount">
              Amount (cents)
            </label>
            <input
              id="new-amount"
              type="number"
              min="1"
              step="1"
              placeholder="2500"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="new-day">
              Day of month
            </label>
            <input
              id="new-day"
              type="number"
              min="1"
              max="31"
              step="1"
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="new-start">
              Start date
            </label>
            <input
              id="new-start"
              type="date"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="new-end">
              End date (optional)
            </label>
            <input
              id="new-end"
              type="date"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="new-category">
              Category
            </label>
            <select
              id="new-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={inputCls}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === "IN" ? "in" : "out"})
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelCls} htmlFor="new-note">
              Note
            </label>
            <input
              id="new-note"
              type="text"
              maxLength={500}
              placeholder="e.g. Cloud hosting invoice"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className={inputCls}
            />
          </div>
          <label className="flex items-end gap-1.5 pb-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Active
          </label>
          <div className="col-span-2 flex items-end justify-end sm:col-span-1">
            <button type="button" onClick={createTemplate} disabled={busy} className={btnPrimary}>
              Add
            </button>
          </div>
        </div>
      </Section>

      <Section title="Your recurring entries">
        {templates.length === 0 ? (
          <p className="text-sm text-gray-500">
            No recurring entries yet. Add one above, then hit “Generate due entries”.
          </p>
        ) : (
          <ul className="space-y-2">
            {templates.map((template) => (
              <li
                key={template.id}
                className={`flex flex-wrap items-center gap-2 rounded-lg border p-2 ${
                  template.active ? "border-gray-200" : "border-dashed bg-gray-50 opacity-70"
                }`}
              >
                <span className="w-28 text-right font-medium tabular-nums text-gray-900">
                  {money(template.amountCents)}
                </span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  step="1"
                  defaultValue={template.dayOfMonth}
                  className={`${inputCls} !w-20 text-center`}
                  aria-label={`Day of month for recurring entry`}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isInteger(v) && v >= 1 && v <= 31 && v !== template.dayOfMonth) {
                      patchTemplate(template.id, { dayOfMonth: v });
                    }
                  }}
                />
                <input
                  type="date"
                  defaultValue={template.startDate}
                  className={`${inputCls} !w-40`}
                  aria-label="Start date"
                  onBlur={(e) => {
                    if (e.target.value && e.target.value !== template.startDate) {
                      patchTemplate(template.id, { startDate: e.target.value });
                    }
                  }}
                />
                <input
                  type="date"
                  defaultValue={template.endDate ?? ""}
                  className={`${inputCls} !w-40`}
                  aria-label="End date"
                  onBlur={(e) => {
                    const v = e.target.value || null;
                    if (v !== template.endDate) patchTemplate(template.id, { endDate: v });
                  }}
                />
                <select
                  value={template.categoryId ?? ""}
                  onChange={(e) =>
                    patchTemplate(template.id, { categoryId: e.target.value || null })
                  }
                  className={`${inputCls} !w-40`}
                  aria-label="Category"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="rounded-full px-2 py-0.5 text-xs font-medium text-gray-600">
                  every {template.dayOfMonth}.
                </span>
                <label className="ml-auto flex items-center gap-1.5 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={template.active}
                    onChange={(e) => patchTemplate(template.id, { active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {template.active ? "Active" : "Paused"}
                </label>
                <button
                  type="button"
                  onClick={() => deleteTemplate(template.id)}
                  disabled={busy}
                  className={`${btnGhost} !px-2 !py-1 text-red-600 hover:bg-red-50`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Generate">
        <p className="text-sm text-gray-500">
          Creates ledger entries for every due month of your active recurring
          entries (up to today), skipping months that already have one. Running
          it again never duplicates anything.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={generate} disabled={busy} className={btnPrimary}>
            Generate due entries
          </button>
          {genResult && <p className="text-sm text-emerald-700">{genResult}</p>}
        </div>
      </Section>
    </div>
  );
}