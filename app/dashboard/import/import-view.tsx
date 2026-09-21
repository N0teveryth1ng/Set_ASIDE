"use client";

import { useMemo, useRef, useState } from "react";
import type { ColumnMapping, ImportRow } from "@/lib/import/validate";

type Status = ImportRow["status"];

interface PreviewResponse {
  fileName: string;
  rowCount: number;
  firstRow: string[];
  parsedRows: string[][];
  categories: { id: string; name: string; type: "IN" | "OUT" }[];
  rows: ImportRow[];
  summary: { total: number; ok: number; warning: number; error: number; blank: number };
}

type Field = "amount" | "date" | "category" | "note";

const FIELDS: { key: Field; label: string }[] = [
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
  { key: "category", label: "Category" },
  { key: "note", label: "Note" },
];

const STATUS_TONE: Record<Status, string> = {
  ok: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
  blank: "bg-gray-100 text-gray-500",
};

const STATUS_LABEL: Record<Status, string> = {
  ok: "Ready",
  warning: "Review",
  error: "Blocked",
  blank: "Skipped",
};

function money(cents: number | null): string {
  if (cents === null) return "";
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const FIELD_PATTERNS: Record<Field, RegExp> = {
  amount: /amount|paid|debit|credit|total|invoice|value|revenue|expense|in\s*$/i,
  date: /date|day|time/i,
  category: /category|categor|type|merchant|project/i,
  note: /note|memo|description|detail|reference|comment/i,
};

function guessMapping(headers: string[]): ColumnMapping {
  const first = (re: RegExp) => {
    const i = headers.findIndex((h) => re.test(h));
    return i >= 0 ? i : -1;
  };
  return {
    amount: first(FIELD_PATTERNS.amount),
    date: first(FIELD_PATTERNS.date),
    category: first(FIELD_PATTERNS.category),
    note: first(FIELD_PATTERNS.note),
  };
}

export function ImportView({ email }: { email: string }) {
  const fileRef = useRef<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({ amount: 0, date: 0, category: -1, note: -1 });
  const [hasHeader, setHasHeader] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [include, setInclude] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const columnCount = preview ? Math.max(1, ...preview.parsedRows.map((r) => r.length)) : 0;
  const labels = useMemo(() => {
    if (!preview) return [];
    const first = preview.parsedRows[0] ?? [];
    return Array.from({ length: columnCount }, (_, i) =>
      hasHeader && first[i] && preview.rowCount > 1 ? first[i] : `Column ${String.fromCharCode(65 + i)}`,
    );
  }, [preview, columnCount, hasHeader]);

  async function loadPreview(nextMapping: ColumnMapping): Promise<PreviewResponse> {
    const file = fileRef.current;
    if (!file) throw new Error("No file selected.");
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("skipRows", hasHeader ? "1" : "0");
    form.append("mapping", JSON.stringify(nextMapping));
    try {
      const res = await fetch("/api/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Preview failed.");
      setMapping(nextMapping);
      setPreview(data);
      const selected = new Set<number>();
      for (const row of data.rows) {
        if (row.status === "ok" || row.status === "warning") selected.add(row.index);
      }
      setInclude(selected);
      setBusy(false);
      return data;
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Preview failed.");
      throw err;
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    fileRef.current = file;
    setDone(null);
    try {
      const probe = await loadPreview({ amount: 0, date: 1, category: 2, note: -1 });
      const guessed = guessMapping(probe.firstRow ?? []);
      await loadPreview(guessed);
    } catch {
      // error already surfaced
    }
  }

  function toggleInclude(index: number, enabled: boolean) {
    setInclude((prev) => {
      const next = new Set(prev);
      if (enabled) next.add(index);
      else next.delete(index);
      return next;
    });
  }

  async function confirmImport() {
    if (!preview) return;
    const rows = preview.rows
      .filter((r) => include.has(r.index) && (r.status === "ok" || r.status === "warning"))
      .map((r) => ({
        amountCents: r.amountCents,
        date: r.date,
        categoryId: r.categoryId,
        note: r.note,
      }));
    if (rows.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data?.invalid?.length
          ? ` Row ${data.invalid[0].index + 1}: ${data.invalid[0].errors.join("; ")}`
          : "";
        throw new Error(`${data.error ?? "Import failed."}${detail}`);
      }
      setDone(data.created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  function updateField(field: Field, value: number) {
    loadPreview({ ...mapping, [field]: value === -1 ? -1 : value });
  }

  function toggleHeader(next: boolean) {
    setHasHeader(next);
    loadPreview(mapping);
  }

  function resetFromState() {
    setPreview(null);
    setDone(null);
    setError(null);
    fileRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }

  if (done !== null) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          ✓
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Imported {done} {done === 1 ? "entry" : "entries"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
          Everything that cleared validation was committed as import-sourced
          entries. Blocked rows were left untouched.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={resetFromState}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Import another file
          </button>
          <a
            href="/dashboard/transactions"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            View transactions
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">1 · Upload a file</h2>
        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-gray-400">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.tsv,.xlsx,.xls,text/csv"
            className="hidden"
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <span className="text-sm font-medium text-gray-700">
            {preview ? preview.fileName : "Drop a CSV or XLSX file here"}
          </span>
          <span className="mt-1 text-xs text-gray-400">or click to browse · 2 MB max</span>
          <span className="mt-3 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
            {preview ? "Replace file" : "Choose file"}
          </span>
        </label>
      </div>

      {preview && (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">2 · Map columns</h2>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              {FIELDS.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-xs font-medium text-gray-500">{field.label}</span>
                  <select
                    value={mapping[field.key] ?? -1}
                    onChange={(e) => updateField(field.key, Number(e.target.value))}
                    className="mt-1 block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value={-1}>— none —</option>
                    {labels.map((label, i) => (
                      <option key={i} value={i}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <label className="flex items-center gap-2 pb-2.5 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => toggleHeader(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                First row is a header
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-800">
                {preview.summary.ok} ready
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800">
                {preview.summary.warning} review
              </span>
              <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-800">
                {preview.summary.error} blocked
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-500">
                {preview.summary.blank} skipped
              </span>
            </div>

            <h2 className="mt-6 text-sm font-semibold text-gray-900">3 · Review rows</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Line</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Note</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.rows.map((row) => {
                    const cells = preview.parsedRows[row.index + dataStartFor(preview, hasHeader)] ?? [];
                    const included = include.has(row.index);
                    const canInclude = row.status === "ok" || row.status === "warning";
                    return (
                      <tr key={row.index} className={included ? "bg-white" : "bg-gray-50/60"}>
                        <td className="px-3 py-2 text-xs text-gray-400">{row.sourceLine}</td>
                        <td className="px-3 py-2 tabular-nums text-gray-900">
                          {money(row.amountCents) || (row.status === "blank" ? "" : cells[mapping.amount] ?? "")}
                        </td>
                        <td className="px-3 py-2 text-gray-900">{row.date ?? (row.status === "blank" ? "" : cells[mapping.date] ?? "")}</td>
                        <td className="px-3 py-2 text-gray-900">{row.categoryName ?? ""}</td>
                        <td className="max-w-xs truncate px-3 py-2 text-gray-500">{row.note ?? ""}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={included}
                              disabled={!canInclude || busy}
                              onChange={(e) => toggleInclude(row.index, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300"
                              aria-label={`Include row ${row.sourceLine}`}
                            />
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[row.status]}`}>
                              {STATUS_LABEL[row.status]}
                            </span>
                          </div>
                        </td>
                        {row.flags.length > 0 && (
                          <td className="px-3 py-2">
                            <div className="max-w-xs space-y-1">
                              {row.flags.map((flag, i) => (
                                <p key={i} className="text-xs text-gray-500">
                                  {flag.message}
                                </p>
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                Blocked rows can’t be imported — they’re never silently altered.
              </p>
              <button
                onClick={confirmImport}
                disabled={busy}
                className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {busy ? "Importing…" : "Import selected rows"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function dataStartFor(preview: PreviewResponse, hasHeader: boolean): number {
  return hasHeader ? 1 : 0;
}