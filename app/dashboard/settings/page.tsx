import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CARDS, normalizeCards } from "@/lib/settings";
import { DashboardHeader } from "../dashboard-header";
import { SettingsView } from "./settings-view";

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
    <main className="min-h-screen bg-gray-50">
      <DashboardHeader email={user.email ?? ""} />
      <section className="mx-auto max-w-3xl px-6 py-10">
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