import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedToCategory } from "@/lib/ledger/mapping";
import { buildCsv, EXPORT_HEADERS, isDateISO } from "@/lib/export";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";
  if (format !== "csv") {
    return NextResponse.json(
      { error: 'Only "csv" is supported; use the printable report at /dashboard/export for PDF' },
      { status: 400 },
    );
  }

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!isDateISO(from) || !isDateISO(to)) {
    return NextResponse.json(
      { error: "from and to are required and must be YYYY-MM-DD dates" },
      { status: 400 },
    );
  }
  if (from > to) {
    return NextResponse.json({ error: "from must not be after to" }, { status: 400 });
  }

  const { data: entries, error } = await supabase
    .from("Entry")
    .select("id,amountCents,date,note,source,category:Category(id,name,type)")
    .eq("userId", user.id)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Raw data export: entries attached to hidden categories are still included.
  const rows = (entries ?? []).map((e) => {
    const category = embedToCategory(e.category);
    return [
      String(e.date),
      String(e.amountCents),
      category?.name ?? "Uncategorized",
      category?.type ?? "",
      e.note == null ? "" : String(e.note),
      String(e.source ?? "manual"),
    ];
  });

  const csv = buildCsv(EXPORT_HEADERS, rows);
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="set-aside-export-${from}-to-${to}.csv"`,
    },
  });
}