import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { embedToCategory } from "@/lib/ledger/mapping";
import { computeTotals } from "@/lib/ledger/ledger";
import { isDateISO } from "@/lib/export";
import { PrintButton } from "./print-button";

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(Math.abs(cents) / 100);
}

export default async function ExportReportPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const from = searchParams.from;
  const to = searchParams.to;
  const valid = isDateISO(from) && isDateISO(to) && from! <= to!;

  if (!valid) {
    return (
      <main className="min-h-screen bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-lg font-semibold text-gray-900">Export report</h1>
          <p className="mt-2 text-sm text-gray-500">
            Pick a date range on the settings page, then open this report.
          </p>
          <Link
            href="/dashboard/settings"
            className="mt-5 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Back to settings
          </Link>
        </div>
      </main>
    );
  }

  const [{ data: entries }, { data: settings }] = await Promise.all([
    supabase
      .from("Entry")
      .select("id,amountCents,date,note,source,category:Category(id,name,type)")
      .eq("userId", user.id)
      .gte("date", from!)
      .lte("date", to!)
      .order("date", { ascending: true }),
    supabase.from("Settings").select("currencyDisplay").eq("userId", user.id).maybeSingle(),
  ]);

  const currency = settings?.currencyDisplay ?? "USD";
  const rows = (entries ?? [])
    .map((e) => ({
      date: String(e.date),
      amountCents: Number(e.amountCents),
      note: e.note == null ? "" : String(e.note),
      source: String(e.source ?? "manual"),
      category: embedToCategory(e.category),
    }))
    .map((e) => ({
      ...e,
      categoryName: e.category?.name ?? "Uncategorized",
      categoryType: e.category?.type ?? null,
    }));

  const totals = computeTotals(
    rows.map((e) => ({
      id: "",
      amountCents: e.amountCents,
      categoryName: e.categoryName,
      categoryType: e.categoryType ?? "OUT",
      date: e.date,
      note: e.note,
    })),
  );

  const rangeLabel = `${from!} → ${to!}`;

  return (
    <main className="min-h-screen bg-white px-8 py-10 text-gray-900 print:px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-200 pb-4 print:hidden">
          <div>
            <h1 className="text-lg font-semibold">Set-Aside export report</h1>
            <p className="text-sm text-gray-500">{rangeLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/api/export?format=csv&from=${encodeURIComponent(from!)}&to=${encodeURIComponent(to!)}`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Download CSV
            </Link>
            <PrintButton />
          </div>
        </div>

        <h1 className="text-3xl font-bold">Export report</h1>
        <p className="mt-1 text-sm text-gray-500">{rangeLabel}</p>

        <table className="mt-6 w-full text-left text-sm">
          <thead className="border-b border-gray-300 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Category</th>
              <th className="py-2 pr-4 font-medium">Note</th>
              <th className="py-2 pr-4 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No entries in this range.
                </td>
              </tr>
            )}
            {rows.map((e) => {
              const tone =
                e.categoryType === null
                  ? "text-gray-600"
                  : e.categoryType === "IN"
                    ? "text-emerald-700"
                    : "text-red-700";
              const amount =
                e.categoryType === null
                  ? money(e.amountCents, currency)
                  : e.categoryType === "IN"
                    ? `+${money(e.amountCents, currency)}`
                    : `\u2212${money(e.amountCents, currency)}`;
              return (
                <tr key={e.date + e.categoryName + e.amountCents + e.note} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-500">{e.date}</td>
                  <td className="py-2 pr-4">{e.categoryName}</td>
                  <td className="py-2 pr-4 text-gray-500">{e.note}</td>
                  <td className={`py-2 pr-4 text-right font-medium tabular-nums ${tone}`}>{amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-4 gap-4 text-sm">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Money in</p>
            <p className="text-lg font-semibold text-emerald-700">
              +{money(totals.inCents, currency)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Money out</p>
            <p className="text-lg font-semibold text-red-700">
              {`\u2212${money(totals.outCents, currency)}`}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Net</p>
            <p className={`text-lg font-semibold ${totals.netCents < 0 ? "text-red-700" : "text-emerald-700"}`}>
              {totals.netCents < 0 ? `\u2212${money(totals.netCents, currency)}` : `+${money(totals.netCents, currency)}`}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Entries</p>
            <p className="text-lg font-semibold text-gray-900">{totals.count}</p>
          </div>
        </div>
      </div>
    </main>
  );
}