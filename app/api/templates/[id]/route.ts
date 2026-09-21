import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseTemplatePatch } from "@/lib/recurring";

const TEMPLATE_SELECT =
  "id,amountCents,dayOfMonth,startDate,endDate,note,active,categoryId,category:Category(name,type)";

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

  const parsed = parseTemplatePatch(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.errors.join("; ") }, { status: 400 });
  }
  const fields = parsed.fields;

  const existing = await supabase
    .from("Template")
    .select("id,startDate,endDate")
    .eq("id", params.id)
    .eq("userId", user.id)
    .maybeSingle();
  if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });
  if (!existing.data) return NextResponse.json({ error: "Recurring entry not found" }, { status: 404 });

  if (
    fields.startDate !== undefined &&
    fields.endDate !== undefined &&
    fields.endDate !== null &&
    fields.startDate > fields.endDate
  ) {
    return NextResponse.json({ error: "endDate must be on or after startDate" }, { status: 400 });
  }
  if (
    fields.endDate !== undefined &&
    fields.endDate !== null &&
    fields.startDate === undefined &&
    fields.endDate < existing.data.startDate
  ) {
    return NextResponse.json({ error: "endDate must be on or after startDate" }, { status: 400 });
  }
  if (
    fields.startDate !== undefined &&
    fields.endDate === undefined &&
    existing.data.endDate !== null &&
    fields.startDate > existing.data.endDate
  ) {
    return NextResponse.json({ error: "endDate must be on or after startDate" }, { status: 400 });
  }

  if (fields.categoryId !== undefined && fields.categoryId !== null) {
    const owned = await supabase
      .from("Category")
      .select("id")
      .eq("id", fields.categoryId)
      .eq("userId", user.id)
      .maybeSingle();
    if (owned.error) return NextResponse.json({ error: owned.error.message }, { status: 500 });
    if (!owned.data) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("Template")
    .update(fields)
    .eq("id", params.id)
    .eq("userId", user.id)
    .select(TEMPLATE_SELECT)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Recurring entry not found" }, { status: 404 });
  return NextResponse.json({ template: data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("Template")
    .delete()
    .eq("id", params.id)
    .eq("userId", user.id)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Recurring entry not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("Template")
    .select(TEMPLATE_SELECT)
    .eq("id", params.id)
    .eq("userId", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Recurring entry not found" }, { status: 404 });
  return NextResponse.json({ template: data });
}