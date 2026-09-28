import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { embedToCategory } from "@/lib/ledger/mapping";
import { computeTotals } from "@/lib/ledger/ledger";
import { isDateISO } from "@/lib/export";
import { PrintButton } from "./print-button";
import { palette, recipe, type } from "@/lib/tokens";

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
      <main className={`min-h-screen bg-white px-6 py-16 ${palette.text}`}>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className={type.pageTitle}>Export report</h1>
          <p className={`mt-2 ${type.text} ${palette.textFaint}`}>
            Pick a date range on the settings page, then open this report.
          </p>
          <Link href="/dashboard/settings" className={`${recipe.btnPrimaryLg} mt-5 inline-block`}>
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

  const rangeLabel = `${from!} to ${to!}`;

  return (
    <main className={`min-h-screen bg-white px-8 py-10 ${palette.text} print:px-4`}>
      <div className="mx-auto max-w-3xl">
        <div className={`mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4 print:hidden ${palette.border}`}>
          <div>
            <h1 className={type.pageTitle}>Set-Aside export report</h1>
            <p className={`${type.text} ${palette.textGhost}`}>{rangeLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/api/export?format=csv&from=${encodeURIComponent(from!)}&to=${encodeURIComponent(to!)}`}
              className={recipe.btnGhost}
            >
              Download CSV
            </Link>
            <PrintButton />
          </div>
        </div>

        <h1 className="text-3xl font-bold">Export report</h1>
        <p className={`mt-1 ${type.text} ${palette.textGhost}`}>{rangeLabel}</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`border-b uppercase tracking-wide ${palette.borderStrong} ${type.caps} ${palette.textGhost}`}>
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
                  <td colSpan={4} className={`py-8 text-center ${palette.textGhost}`}>
                    No entries in this range.
                  </td>
                </tr>
              )}
              {rows.map((e) => {
                const tone =
                  e.categoryType === null
                    ? palette.textSubtle
                    : e.categoryType === "IN"
                      ? palette.gainStrong
                      : palette.lossStrong;
                const amount =
                  e.categoryType === null
                    ? money(e.amountCents, currency)
                    : e.categoryType === "IN"
                      ? `+${money(e.amountCents, currency)}`
                      : `\u2212${money(e.amountCents, currency)}`;
                return (
                  <tr key={e.date + e.categoryName + e.amountCents + e.note} className={`border-b ${palette.divide}`}>
                    <td className={`py-2 pr-4 ${palette.textGhost}`}>{e.date}</td>
                    <td className="py-2 pr-4">{e.categoryName}</td>
                    <td className={`py-2 pr-4 ${palette.textGhost}`}>{e.note}</td>
                    <td className={`py-2 pr-4 text-right font-medium tabular-nums ${tone}`}>{amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div className={`rounded-lg p-3 ${palette.inkSoft}`}>
            <p className={palette.textGhost}>Money in</p>
            <p className={`text-lg font-semibold ${palette.gainStrong}`}>
              +{money(totals.inCents, currency)}
            </p>
          </div>
          <div className={`rounded-lg p-3 ${palette.inkSoft}`}>
            <p className={palette.textGhost}>Money out</p>
            <p className={`text-lg font-semibold ${palette.lossStrong}`}>
              {`\u2212${money(totals.outCents, currency)}`}
            </p>
          </div>
          <div className={`rounded-lg p-3 ${palette.inkSoft}`}>
            <p className={palette.textGhost}>Net</p>
            <p className={`text-lg font-semibold ${totals.netCents < 0 ? palette.lossStrong : palette.gainStrong}`}>
              {totals.netCents < 0 ? `\u2212${money(totals.netCents, currency)}` : `+${money(totals.netCents, currency)}`}
            </p>
          </div>
          <div className={`rounded-lg p-3 ${palette.inkSoft}`}>
            <p className={palette.textGhost}>Entries</p>
            <p className={`text-lg font-semibold ${palette.text}`}>{totals.count}</p>
          </div>
        </div>
      </div>
    </main>
  );
}