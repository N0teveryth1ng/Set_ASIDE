import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRealDate, monthKey, occurrenceDates } from "@/lib/recurring";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Materializes active templates into entries as-of `through` (default: today,
// UTC). One entry per (template, calendar month); months that already contain
// an entry for a template are skipped, which makes the operation idempotent.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let through = new Date().toISOString().slice(0, 10);
  try {
    const body = await request.json();
    if (body !== null && typeof body === "object" && typeof body.through === "string") {
      if (!DATE_RE.test(body.through) || !isRealDate(body.through)) {
        return NextResponse.json({ error: "through must be YYYY-MM-DD" }, { status: 400 });
      }
      through = body.through;
    }
  } catch {
    // no body -> default through to today
  }

  const { data: templates, error: templateError } = await supabase
    .from("Template")
    .select("id,amountCents,dayOfMonth,startDate,endDate,note,categoryId")
    .eq("userId", user.id)
    .eq("active", true);
  if (templateError) {
    return NextResponse.json({ error: templateError.message }, { status: 500 });
  }
  if (!templates || templates.length === 0) {
    return NextResponse.json({ created: 0, skipped: 0 });
  }

  const ids = templates.map((t) => t.id);
  const { data: existing, error: existingError } = await supabase
    .from("Entry")
    .select("templateId,date")
    .eq("userId", user.id)
    .in("templateId", ids);
  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const byMonth = new Map<string, Set<string>>();
  for (const entry of existing ?? []) {
    if (entry.templateId === null) continue;
    const key = entry.templateId as string;
    const set = byMonth.get(key) ?? new Set<string>();
    set.add(monthKey(entry.date));
    byMonth.set(key, set);
  }

  const rows: Array<Record<string, unknown>> = [];
  let totalOccurrences = 0;
  for (const template of templates) {
    const dates = occurrenceDates(
      {
        dayOfMonth: template.dayOfMonth,
        startDate: template.startDate,
        endDate: template.endDate,
      },
      template.startDate,
      through,
    ).filter((d) => d <= through);

    const seen = byMonth.get(template.id) ?? new Set<string>();
    for (const date of dates) {
      totalOccurrences += 1;
      const key = monthKey(date);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        amountCents: template.amountCents,
        date,
        note: template.note,
        categoryId: template.categoryId,
        source: "recurring",
        templateId: template.id,
        userId: user.id,
      });
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ created: 0, skipped: totalOccurrences });
  }

  const { error: insertError } = await supabase.from("Entry").insert(rows);
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ created: rows.length, skipped: totalOccurrences - rows.length });
}