import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseEntryInput } from "@/lib/entry-input";

const ENTRY_SELECT =
  "id,amountCents,date,note,source,createdAt,category:Category(name,type)";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("Entry")
    .select(ENTRY_SELECT)
    .eq("userId", user.id)
    .order("date", { ascending: false })
    .order("createdAt", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = parseEntryInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.errors.join("; ") }, { status: 400 });
  }
  const { amountCents, date, note, categoryId } = parsed.value;

  if (categoryId !== null) {
    const owned = await supabase
      .from("Category")
      .select("id")
      .eq("id", categoryId)
      .eq("userId", user.id)
      .maybeSingle();
    if (owned.error) return NextResponse.json({ error: owned.error.message }, { status: 500 });
    if (!owned.data) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("Entry")
    .insert({
      amountCents,
      date,
      note,
      categoryId,
      source: "manual",
      userId: user.id,
    })
    .select(ENTRY_SELECT)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: data }, { status: 201 });
}