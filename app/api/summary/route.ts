import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toLedgerEntry } from "@/lib/ledger/mapping";
import { withoutHiddenCategories } from "@/lib/ledger/filter";
import { buildSummary } from "@/lib/summary";
import type { Period } from "@/lib/ledger/types";

const PERIODS: readonly Period[] = ["month", "quarter", "year", "all"];

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const requested = new URL(request.url).searchParams.get("period");
  const period: Period = PERIODS.includes(requested as Period) ? (requested as Period) : "month";

  const [{ data: entries }, { data: settings }, { data: categories }] = await Promise.all([
    supabase
      .from("Entry")
      .select("id,amountCents,date,note,source,category:Category(id,name,type)")
      .eq("userId", user.id),
    supabase.from("Settings").select("taxRate,currencyDisplay").eq("userId", user.id).maybeSingle(),
    supabase.from("Category").select("id,hidden").eq("userId", user.id),
  ]);

  const hiddenIds = new Set(
    (categories ?? []).filter((c) => c.hidden).map((c) => c.id),
  );

  const summary = buildSummary(
    withoutHiddenCategories(entries ?? [], hiddenIds).map(toLedgerEntry),
    period,
    settings?.taxRate ?? 23,
    settings?.currencyDisplay ?? "USD",
  );

  return NextResponse.json({ summary });
}