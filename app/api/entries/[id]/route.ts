import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseEntryInput } from "@/lib/entry-input";

const ENTRY_SELECT =
  "id,amountCents,date,note,source,createdAt,category:Category(name,type)";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
  const next = parsed.value;

  if (next.categoryId !== null) {
    const owned = await supabase
      .from("Category")
      .select("id")
      .eq("id", next.categoryId)
      .eq("userId", user.id)
      .maybeSingle();
    if (owned.error) return NextResponse.json({ error: owned.error.message }, { status: 500 });
    if (!owned.data) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("Entry")
    .update({
      amountCents: next.amountCents,
      date: next.date,
      note: next.note,
      categoryId: next.categoryId,
    })
    .eq("id", params.id)
    .eq("userId", user.id)
    .select(ENTRY_SELECT)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  return NextResponse.json({ entry: data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("Entry")
    .delete()
    .eq("id", params.id)
    .eq("userId", user.id)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}