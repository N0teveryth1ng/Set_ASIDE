import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toLedgerEntry } from "@/lib/ledger/mapping";
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

  const [{ data: entries }, { data: settings }] = await Promise.all([
    supabase
      .from("Entry")
      .select("id,amountCents,date,note,source,category:Category(id,name,type)")
      .eq("userId", user.id),
    supabase.from("Settings").select("taxRate,currencyDisplay").eq("userId", user.id).maybeSingle(),
  ]);

  const summary = buildSummary(
    (entries ?? []).map(toLedgerEntry),
    period,
    settings?.taxRate ?? 23,
    settings?.currencyDisplay ?? "USD",
  );

  return NextResponse.json({ summary });
}