import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeCategoryName,
  normalizeCategoryType,
  normalizeHidden,
  normalizeSortOrder,
} from "@/lib/settings";

const CATEGORY_SELECT = "id,name,type,hidden,sortOrder";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  const next: Record<string, unknown> = {};
  if ("name" in body) {
    const parsed = normalizeCategoryName(body.name);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    next.name = parsed.value;
  }
  if ("type" in body) {
    const parsed = normalizeCategoryType(body.type);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    next.type = parsed.value;
  }
  if ("hidden" in body) {
    const parsed = normalizeHidden(body.hidden);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    next.hidden = parsed.value;
  }
  if ("sortOrder" in body) {
    const parsed = normalizeSortOrder(body.sortOrder);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    next.sortOrder = parsed.value;
  }

  if (next.name !== undefined) {
    const clash = await supabase
      .from("Category")
      .select("id")
      .eq("userId", user.id)
      .ilike("name", String(next.name))
      .neq("id", params.id)
      .maybeSingle();
    if (clash.error) return NextResponse.json({ error: clash.error.message }, { status: 500 });
    if (clash.data) {
      return NextResponse.json(
        { error: `A category named "${next.name}" already exists` },
        { status: 409 },
      );
    }
  }

  const { data, error } = await supabase
    .from("Category")
    .update(next)
    .eq("id", params.id)
    .eq("userId", user.id)
    .select(CATEGORY_SELECT)
    .maybeSingle();

  if (error) {
    if (/(duplicate key|unique)/i.test(error.message)) {
      return NextResponse.json(
        { error: `A category named "${next.name}" already exists` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  return NextResponse.json({ category: data });
}