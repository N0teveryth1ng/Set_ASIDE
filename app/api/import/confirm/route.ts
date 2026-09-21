import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseEntryInput } from "@/lib/entry-input";

interface ImportRowInput {
  amountCents: number;
  date: string;
  categoryId: string | null;
  note: string | null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { rows?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
  }
  const rawRows = Array.isArray(body.rows) ? body.rows : null;
  if (!rawRows || rawRows.length === 0) {
    return NextResponse.json({ error: "rows must be a non-empty array" }, { status: 400 });
  }
  if (rawRows.length > 5000) {
    return NextResponse.json({ error: "Too many rows (max 5000)" }, { status: 400 });
  }

  // Re-validate everything server-side. The client's flags are advisory;
  // a fabricated or stale row must not sneak in.
  const invalid: { index: number; errors: string[] }[] = [];
  for (let i = 0; i < rawRows.length; i += 1) {
    const parsed = parseEntryInput(rawRows[i]);
    if (!parsed.ok) invalid.push({ index: i, errors: parsed.errors });
  }
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: "Some rows are invalid", invalid },
      { status: 422 },
    );
  }

  const rows = (rawRows as unknown) as ImportRowInput[];
  const categoryIds = [...new Set(rows.map((r) => r.categoryId).filter((id): id is string => id !== null))];
  if (categoryIds.length > 0) {
    const { data: owned, error } = await supabase
      .from("Category")
      .select("id")
      .eq("userId", user.id)
      .in("id", categoryIds);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const ownedSet = new Set((owned ?? []).map((c) => c.id));
    const foreign = categoryIds.filter((id) => !ownedSet.has(id));
    if (foreign.length > 0) {
      return NextResponse.json(
        { error: "One or more categories do not belong to you", categoryIds: foreign },
        { status: 422 },
      );
    }
  }

  const toInsert = rows.map((r) => ({
    amountCents: r.amountCents,
    date: r.date,
    note: r.note,
    categoryId: r.categoryId,
    source: "import" as const,
    userId: user.id,
  }));

  const { data, error } = await supabase
    .from("Entry")
    .insert(toInsert)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ created: data?.length ?? 0 });
}