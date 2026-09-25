import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CARDS, normalizeCards } from "@/lib/settings";
import { SettingsView } from "./settings-view";
import { palette, space } from "@/lib/tokens";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: settings }, { data: categories }] = await Promise.all([
    supabase.from("Settings").select("*").eq("userId", user.id).maybeSingle(),
    supabase
      .from("Category")
      .select("id,name,type,hidden,sortOrder")
      .eq("userId", user.id)
      .order("sortOrder", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (!settings) redirect("/dashboard/onboarding");

  return (
    <main className={palette.canvas}>
      <section className={`${space.containerMd} py-10`}>
        <SettingsView
          settings={{
            taxRate: settings.taxRate,
            activePreset: settings.activePreset ?? null,
            currencyDisplay: settings.currencyDisplay,
            cards: normalizeCards(settings.cards).ok ? settings.cards : DEFAULT_CARDS,
          }}
          categories={
            (categories ?? []).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
              hidden: c.hidden,
              sortOrder: c.sortOrder,
            }))
          }
        />
      </section>
    </main>
  );
}