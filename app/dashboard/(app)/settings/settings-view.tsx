"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { PRESETS } from "@/lib/presets";
import { CARD_LABELS, CARD_TOKENS, type CardToken } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { palette, recipe, space, type } from "@/lib/tokens";

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={`${recipe.surface} p-5`}>
      <h2 className={type.sectionTitle + " " + palette.text}>{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MoveButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-6 w-6 border-gray-300 text-gray-400 hover:bg-gray-50"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </Button>
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
      className={`flex flex-wrap items-center gap-2 rounded-lg border p-2 ${
        visible ? palette.border : `${palette.borderStrong} border-dashed ${palette.inkSoft} opacity-70`
      }`}
    >
      <MoveButton
        onClick={() => onMove(-1)}
        disabled={!visible || isFirst || busy}
        label="Move up"
      >
        <ArrowUp size={14} strokeWidth={2} />
      </MoveButton>
      <MoveButton
        onClick={() => onMove(1)}
        disabled={!visible || isLast || busy}
        label="Move down"
      >
        <ArrowDown size={14} strokeWidth={2} />
      </MoveButton>
      <span className={`text-sm font-medium ${palette.text}`}>{CARD_LABELS[tokenName]}</span>
      <label className={`ml-auto flex items-center gap-1.5 text-sm ${palette.textSubtle}`}>
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => onToggle(e.target.checked)}
          className={`h-4 w-4 rounded ${palette.borderStrong}`}
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
    <div className={space.stack}>
      <div>
        <h2 className={type.pageTitle + " " + palette.text}>Settings</h2>
        <p className={`${type.text} ${palette.textGhost}`}>
          Customize your categories, tax rate, overview cards, and exports.
        </p>
      </div>

      {error && <p className={recipe.errorBoxLg}>{error}</p>}

      <Section title="Categories">
        <ul className="space-y-2">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className={`flex flex-wrap items-center gap-2 rounded-lg border p-2 ${
                category.hidden
                  ? `${palette.borderStrong} border-dashed ${palette.inkSoft} opacity-70`
                  : palette.border
              }`}
            >
              <MoveButton
                onClick={() => moveCategory(index, -1)}
                disabled={index === 0 || busy}
                label="Move up"
              >
                <ArrowUp size={14} strokeWidth={2} />
              </MoveButton>
              <MoveButton
                onClick={() => moveCategory(index, 1)}
                disabled={index === categories.length - 1 || busy}
                label="Move down"
              >
                <ArrowDown size={14} strokeWidth={2} />
              </MoveButton>
              <Input
                type="text"
                maxLength={50}
                defaultValue={category.name}
                className="w-56 font-medium"
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== category.name) patchCategory(category.id, { name: value });
                }}
              />
              <span
                className={`${recipe.chip} ${
                  category.type === "IN" ? palette.gainChip : palette.lossChip
                }`}
              >
                {category.type === "IN" ? "+ Income" : "− Expense"}
              </span>
              <label className={`ml-auto flex items-center gap-1.5 text-sm ${palette.textSubtle}`}>
                <input
                  type="checkbox"
                  checked={!category.hidden}
                  onChange={(e) => patchCategory(category.id, { hidden: !e.target.checked })}
                  className={`h-4 w-4 rounded ${palette.borderStrong}`}
                />
                {category.hidden ? "Hidden" : "Visible"}
              </label>
            </li>
          ))}
        </ul>

        <div className={`mt-4 flex flex-wrap items-end gap-3 border-t pt-4 ${palette.divideStrong}`}>
          <div>
            <Label htmlFor="new-cat-name" className={palette.textMuted}>
              New category
            </Label>
            <Input
              id="new-cat-name"
              type="text"
              maxLength={50}
              placeholder="e.g. Subscriptions"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="new-cat-type" className={palette.textMuted}>
              Type
            </Label>
            <Select
              value={newType}
              onValueChange={(value) => setNewType(value as "IN" | "OUT")}
            >
              <SelectTrigger id="new-cat-type" className="mt-1.5 w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OUT">Expense (money out)</SelectItem>
                <SelectItem value="IN">Income (money in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={addCategory} disabled={busy}>
            Add
          </Button>
        </div>
      </Section>

      <Section title="Tax rate">
        <p className={`${type.text} ${palette.textGhost}`}>
          Percent of your positive net position set aside for taxes each period.
        </p>
        <div className="mt-3 flex items-end gap-2">
          <div>
            <Label htmlFor="tax-rate" className={palette.textMuted}>
              Rate (%)
            </Label>
            <Input
              id="tax-rate"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={taxInput}
              onChange={(e) => setTaxInput(e.target.value)}
              className="mt-1.5 w-32"
            />
          </div>
          <Button type="button" onClick={saveTaxRate} disabled={busy}>
            Save
          </Button>
        </div>
      </Section>

      <Section title="Active preset">
        <p className={`${type.text} ${palette.textGhost}`}>
          Switching presets merges that preset&apos;s categories into your list
          (existing categories are kept).
        </p>
        <Select
          value={settings.activePreset ?? "Custom"}
          onValueChange={(value) => switchPreset(value)}
          disabled={busy}
        >
          <SelectTrigger className="mt-3 w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Custom" disabled>
              Custom
            </SelectItem>
            {PRESETS.map((p) => (
              <SelectItem key={p.preset} value={p.preset}>
                {p.preset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Section>

      <Section title="Overview cards">
        <p className={`${type.text} ${palette.textGhost}`}>
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
        <p className={`${type.text} ${palette.textGhost}`}>
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
        <Label htmlFor="export-from" className={palette.textMuted}>
          From
        </Label>
        <Input
          id="export-from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="export-to" className={palette.textMuted}>
          To
        </Label>
        <Input
          id="export-to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <Button type="button" onClick={() => onDownload(from, to)} disabled={busy}>
        Download CSV
      </Button>
      <Button variant="outline" asChild>
        <a href={`/dashboard/export?${range}`} target="_blank">
          Printable report
        </a>
      </Button>
    </div>
  );
}