import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CARDS,
  normalizeTaxRate,
  normalizeCurrency,
  normalizeCards,
} from "@/lib/settings";
import { getPreset } from "@/lib/presets";

function toSettingsResponse(settings: {
  taxRate: number;
  currencyDisplay: string;
  activePreset: string | null;
  onboarded: boolean;
  cards: unknown;
}) {
  return {
    taxRate: settings.taxRate,
    currencyDisplay: settings.currencyDisplay,
    activePreset: settings.activePreset,
    onboarded: settings.onboarded,
    cards: normalizeCards(settings.cards).ok ? settings.cards : DEFAULT_CARDS,
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("Settings")
    .select("taxRate,currencyDisplay,activePreset,onboarded,cards")
    .eq("userId", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not onboarded yet" }, { status: 404 });
  return NextResponse.json({ settings: toSettingsResponse(data) });
}

export async function PATCH(request: Request) {
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

  if ("taxRate" in body) {
    const parsed = normalizeTaxRate(body.taxRate);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    next.taxRate = parsed.value;
  }
  if ("currencyDisplay" in body) {
    const parsed = normalizeCurrency(body.currencyDisplay);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    next.currencyDisplay = parsed.value;
  }
  if ("cards" in body) {
    const parsed = normalizeCards(body.cards);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    next.cards = parsed.value;
  }
  if ("activePreset" in body) {
    let preset;
    try {
      preset = getPreset(body.activePreset as never).preset;
    } catch {
      return NextResponse.json({ error: "Unknown preset" }, { status: 400 });
    }
    const presetDef = getPreset(preset);
    const seeded = await supabase.from("Category").upsert(
      presetDef.categories.map((c, i) => ({
        name: c.name,
        type: c.type,
        userId: user.id,
        sortOrder: i,
      })),
      { onConflict: "userId,name", ignoreDuplicates: true },
    );
    if (seeded.error) return NextResponse.json({ error: seeded.error.message }, { status: 500 });
    next.activePreset = preset;
  }

  const { data, error } = await supabase
    .from("Settings")
    .update(next)
    .eq("userId", user.id)
    .select("taxRate,currencyDisplay,activePreset,onboarded,cards")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not onboarded yet" }, { status: 404 });
  return NextResponse.json({ settings: toSettingsResponse(data) });
}
