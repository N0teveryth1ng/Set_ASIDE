"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRESETS } from "@/lib/presets";
import { CARD_LABELS, CARD_TOKENS, type CardToken } from "@/lib/settings";

export interface SettingsState {
  taxRate: number;
  activePreset: string | null;
  currencyDisplay: string;
  cards: readonly string[];
}

export interface CategoryRow {
  id: string;
  name: string;
  type: "IN" | "OUT";
  hidden: boolean;
  sortOrder: number;
}

interface SettingsResponse {
  settings: SettingsState;
}
interface CategoryResponse {
  category: CategoryRow;
}

const inputCls =
  "w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none";
const labelCls = "block text-sm font-medium text-gray-700";
const btnPrimary =
  "rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-60";
const btnGhost =
  "rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CardRow({
  token,
  visible,
  isFirst,
  isLast,
  busy,
  onMove,
  onToggle,
}: {
  token: string;
  visible: boolean;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onMove: (delta: -1 | 1) => void;
  onToggle: (visible: boolean) => void;
}) {
  const tokenName = token as CardToken;
  return (
    <li
      className={`flex items-center gap-2 rounded-lg border p-2 ${
        visible ? "border-gray-200" : "border-dashed bg-gray-50 opacity-70"
      }`}
    >
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={!visible || isFirst || busy}
        className="rounded border border-gray-300 px-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={!visible || isLast || busy}
        className="rounded border border-gray-300 px-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        aria-label="Move down"
      >
        ↓
      </button>
      <span className="text-sm font-medium text-gray-800">{CARD_LABELS[tokenName]}</span>
      <label className="ml-auto flex items-center gap-1.5 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        Shown
      </label>
    </li>
  );
}

export function SettingsView({
  settings: initial,
  categories: initialCategories,
}: {
  settings: SettingsState;
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsState>(initial);
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taxInput, setTaxInput] = useState(String(initial.taxRate));
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"IN" | "OUT">("OUT");

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

  function patchSettings(next: Partial<SettingsState>) {
    const data = request<SettingsResponse>("PATCH", "/api/settings", next);
    return data;
  }

  async function saveTaxRate() {
    const value = Number(taxInput);
    if (!Number.isFinite(value)) {
      setError("Enter a number between 0 and 100.");
      return;
    }
    const data = await patchSettings({ taxRate: value });
    if (data) {
      setSettings({ ...settings, taxRate: data.settings.taxRate });
      setTaxInput(String(data.settings.taxRate));
    }
  }

  async function switchPreset(preset: string) {
    if (preset === settings.activePreset) return;
    const data = await patchSettings({ activePreset: preset });
    if (data) {
      setSettings({ ...settings, activePreset: data.settings.activePreset });
      router.refresh();
    }
  }

  async function addCategory() {
    const name = newName.trim();
    if (!name) {
      setError("Enter a category name.");
      return;
    }
    const data = await request<CategoryResponse>("POST", "/api/categories", {
      name,
      type: newType,
    });
    if (data) {
      setNewName("");
      router.refresh();
    }
  }

  async function patchCategory(id: string, next: Partial<CategoryRow>) {
    const data = await request<CategoryResponse>("PATCH", `/api/categories/${id}`, next);
    if (data) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data.category } : c)),
      );
    }
  }

  function patchSorted(sorted: CategoryRow[]) {
    setCategories(sorted);
    sorted.forEach((row) => {
      void request("PATCH", `/api/categories/${row.id}`, { sortOrder: row.sortOrder });
    });
  }

  function moveCategory(index: number, delta: -1 | 1) {
    const next = [...categories];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const before = next[index];
    next[index] = next[target];
    next[target] = before;
    next.forEach((row, i) => (row.sortOrder = i));
    patchSorted(next);
  }

  function toggleCard(token: string, visible: boolean) {
    const current = [...settings.cards];
    const next = visible
      ? current.includes(token)
        ? current
        : [...current, token]
      : current.filter((t) => t !== token);
    void (async () => {
      const data = await patchSettings({ cards: next });
      if (data) setSettings({ ...settings, cards: data.settings.cards });
    })();
  }

  function moveCard(index: number, delta: -1 | 1) {
    const next = [...settings.cards];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const before = next[index];
    next[index] = next[target];
    next[target] = before;
    void (async () => {
      const data = await patchSettings({ cards: next });
      if (data) setSettings({ ...settings, cards: data.settings.cards });
    })();
  }

  async function downloadCsv(from: string, to: string) {
    if (!from || !to) {
      setError("Pick both a from and a to date.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/export?format=csv&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Export failed (${res.status})`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `set-aside-export-${from}-to-${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">
          Customize your categories, tax rate, overview cards, and exports.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Section title="Categories">
        <ul className="space-y-2">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className={`flex items-center gap-2 rounded-lg border p-2 ${
                category.hidden ? "border-dashed bg-gray-50 opacity-70" : "border-gray-200"
              }`}
            >
              <button
                type="button"
                onClick={() => moveCategory(index, -1)}
                disabled={index === 0 || busy}
                className="rounded border border-gray-300 px-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveCategory(index, 1)}
                disabled={index === categories.length - 1 || busy}
                className="rounded border border-gray-300 px-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Move down"
              >
                ↓
              </button>
              <input
                type="text"
                maxLength={50}
                defaultValue={category.name}
                className={`${inputCls} !w-56 font-medium`}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== category.name) patchCategory(category.id, { name: value });
                }}
              />
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  category.type === "IN"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {category.type === "IN" ? "+ Income" : "− Expense"}
              </span>
              <label className="ml-auto flex items-center gap-1.5 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={!category.hidden}
                  onChange={(e) => patchCategory(category.id, { hidden: !e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {category.hidden ? "Hidden" : "Visible"}
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-end gap-2 border-t border-gray-100 pt-4">
          <div>
            <label className={labelCls} htmlFor="new-cat-name">
              New category
            </label>
            <input
              id="new-cat-name"
              type="text"
              maxLength={50}
              placeholder="e.g. Subscriptions"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="new-cat-type">
              Type
            </label>
            <select
              id="new-cat-type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as "IN" | "OUT")}
              className={inputCls}
            >
              <option value="OUT">Expense (money out)</option>
              <option value="IN">Income (money in)</option>
            </select>
          </div>
          <button type="button" onClick={addCategory} disabled={busy} className={btnPrimary}>
            Add
          </button>
        </div>
      </Section>

      <Section title="Tax rate">
        <p className="text-sm text-gray-500">
          Percent of your positive net position set aside for taxes each period.
        </p>
        <div className="mt-3 flex items-end gap-2">
          <div>
            <label className={labelCls} htmlFor="tax-rate">
              Rate (%)
            </label>
            <input
              id="tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={taxInput}
              onChange={(e) => setTaxInput(e.target.value)}
              className={`${inputCls} !w-32`}
            />
          </div>
          <button type="button" onClick={saveTaxRate} disabled={busy} className={btnPrimary}>
            Save
          </button>
        </div>
      </Section>

      <Section title="Active preset">
        <p className="text-sm text-gray-500">
          Switching presets merges that preset&apos;s categories into your list
          (existing categories are kept).
        </p>
        <select
          value={settings.activePreset ?? "Custom"}
          onChange={(e) => switchPreset(e.target.value)}
          disabled={busy}
          className={`${inputCls} !w-64`}
        >
          <option value="Custom" disabled>
            Custom
          </option>
          {PRESETS.map((p) => (
            <option key={p.preset} value={p.preset}>
              {p.preset}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Overview cards">
        <p className="text-sm text-gray-500">
          Choose which Overview sections show and their order during the period.
        </p>
        <ul className="mt-3 space-y-2">
          {settings.cards.map((token, index) => (
            <CardRow
              key={token}
              token={token}
              visible
              isFirst={index === 0}
              isLast={index === settings.cards.length - 1}
              busy={busy}
              onMove={(delta) => moveCard(index, delta)}
              onToggle={(visible) => toggleCard(token, visible)}
            />
          ))}
          {CARD_TOKENS.filter((token) => !settings.cards.includes(token)).map((token) => (
            <CardRow
              key={token}
              token={token}
              visible={false}
              isFirst
              isLast
              busy={busy}
              onMove={() => undefined}
              onToggle={(visible) => toggleCard(token, visible)}
            />
          ))}
        </ul>
      </Section>

      <Section title="Export">
        <p className="text-sm text-gray-500">
          Download every entry in a date range as CSV, or open a printable report
          you can save as PDF from the browser.
        </p>
        <ExportControls onDownload={downloadCsv} busy={busy} />
      </Section>
    </div>
  );
}

function ExportControls({
  onDownload,
  busy,
}: {
  onDownload: (from: string, to: string) => void;
  busy: boolean;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const range = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  return (
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <div>
        <label className={labelCls} htmlFor="export-from">
          From
        </label>
        <input
          id="export-from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="export-to">
          To
        </label>
        <input
          id="export-to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={inputCls}
        />
      </div>
      <button type="button" onClick={() => onDownload(from, to)} disabled={busy} className={btnPrimary}>
        Download CSV
      </button>
      <a
        href={`/dashboard/export?${range}`}
        target="_blank"
        className={`${btnGhost} text-center`}
      >
        Printable report
      </a>
    </div>
  );
}