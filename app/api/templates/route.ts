import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseTemplateInput } from "@/lib/recurring";

const TEMPLATE_SELECT =
  "id,amountCents,dayOfMonth,startDate,endDate,note,active,categoryId,category:Category(name,type)";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("Template")
    .select(TEMPLATE_SELECT)
    .eq("userId", user.id)
    .order("dayOfMonth", { ascending: true })
    .order("createdAt", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data });
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

  const parsed = parseTemplateInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.errors.join("; ") }, { status: 400 });
  }
  const { amountCents, dayOfMonth, startDate, endDate, note, categoryId, active } =
    parsed.value;

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
    .from("Template")
    .insert({
      amountCents,
      dayOfMonth,
      startDate,
      endDate,
      note,
      active,
      categoryId,
      userId: user.id,
    })
    .select(TEMPLATE_SELECT)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data }, { status: 201 });
}