import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCategoryName, normalizeCategoryType } from "@/lib/settings";

const CATEGORY_SELECT = "id,name,type,hidden,sortOrder";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("Category")
    .select(CATEGORY_SELECT)
    .eq("userId", user.id)
    .order("sortOrder", { ascending: true })
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error();
    body = raw as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Expected a JSON object body" }, { status: 400 });
  }

  const name = normalizeCategoryName(body.name);
  if (!name.ok) return NextResponse.json({ error: name.error }, { status: 400 });
  const type = normalizeCategoryType(body.type);
  if (!type.ok) return NextResponse.json({ error: type.error }, { status: 400 });

  const exists = await supabase
    .from("Category")
    .select("id")
    .eq("userId", user.id)
    .ilike("name", name.value)
    .maybeSingle();
  if (exists.error) return NextResponse.json({ error: exists.error.message }, { status: 500 });
  if (exists.data) {
    return NextResponse.json(
      { error: `A category named "${name.value}" already exists` },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("Category")
    .insert({ name: name.value, type: type.value, userId: user.id, hidden: false, sortOrder: 0 })
    .select(CATEGORY_SELECT)
    .single();

  if (error) {
    if (/(duplicate key|unique)/i.test(error.message)) {
      return NextResponse.json(
        { error: `A category named "${name.value}" already exists` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ category: data }, { status: 201 });
}