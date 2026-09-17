import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPreset, type PresetType } from "@/lib/presets";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  let preset: PresetType;
  try {
    const body = await request.json();
    preset = getPreset(body.preset).preset;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unknown preset" },
      { status: 400 },
    );
  }

  const existing = await supabase
    .from("Settings")
    .select("id")
    .eq("userId", user.id)
    .maybeSingle();

  if (existing.data) {
    return NextResponse.json({ ok: true, already: true });
  }

  // A fresh auth user has no row in the public "User" table until their first
  // login — create it here (id = auth uid) so seeded rows satisfy the FK.
  const syncUser = await supabase
    .from("User")
    .upsert({ id: user.id, email: user.email ?? "" }, { onConflict: "id", ignoreDuplicates: true });
  if (syncUser.error) {
    return NextResponse.json(
      { ok: false, error: syncUser.error.message },
      { status: 500 },
    );
  }

  const presetDef = getPreset(preset);
  const categories = presetDef.categories.map((c) => ({
    name: c.name,
    type: c.type,
    userId: user.id,
  }));

  const seededCats = await supabase
    .from("Category")
    .upsert(categories, { onConflict: "userId,name", ignoreDuplicates: true });
  if (seededCats.error) {
    return NextResponse.json(
      { ok: false, error: seededCats.error.message },
      { status: 500 },
    );
  }

  const seededSettings = await supabase.from("Settings").insert({
    userId: user.id,
    activePreset: preset,
    taxRate: 23,
    currencyDisplay: "USD",
    onboarded: false,
  });
  if (seededSettings.error) {
    return NextResponse.json(
      { ok: false, error: seededSettings.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    preset,
    categories: categories.length,
  });
}