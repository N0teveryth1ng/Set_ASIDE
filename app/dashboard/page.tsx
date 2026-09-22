import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toLedgerEntry } from "@/lib/ledger/mapping";
import { withoutHiddenCategories } from "@/lib/ledger/filter";
import { buildSummary } from "@/lib/summary";
import { DEFAULT_CARDS, normalizeCards, type CardToken } from "@/lib/settings";
import { DashboardHeader } from "./dashboard-header";
import { TutorialOverlay } from "./tutorial-overlay";
import { OverviewView } from "./overview-view";
import { palette, recipe, space, type } from "@/lib/tokens";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: settings }, { data: entries }, { data: categories }] = await Promise.all([
    supabase.from("Settings").select("*").eq("userId", user.id).maybeSingle(),
    supabase
      .from("Entry")
      .select("id,amountCents,date,note,source,category:Category(id,name,type)")
      .eq("userId", user.id),
    supabase.from("Category").select("id,hidden").eq("userId", user.id),
  ]);

  if (!settings) redirect("/dashboard/onboarding");

  const hiddenIds = new Set(
    (categories ?? []).filter((c) => c.hidden).map((c) => c.id),
  );

  const rows = entries ?? [];
  const empty = rows.length === 0;
  const categoryCount = categories?.length ?? 0;
  const activePreset = settings.activePreset ?? "Custom";
  const cards: readonly CardToken[] = normalizeCards(settings.cards).ok
    ? (settings.cards as CardToken[])
    : DEFAULT_CARDS;

  return (
    <main className={recipe.page}>
      <DashboardHeader email={user.email ?? ""} />

      <section className={`${space.containerLg} py-10`}>
        {empty ? (
          <div className={recipe.surfaceDashed + " px-6 py-16 text-center"}>
            <div
              className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full ${palette.inkSoft} ${palette.textGhost}`}
            >
              <BookOpen size={20} strokeWidth={2} />
            </div>
            <h2 className={`${type.heading} ${palette.text}`}>Your ledger is empty</h2>
            <p className={`mx-auto mt-2 max-w-md text-sm ${palette.textSubtle}`}>
              Add your first entry or import a file to start tracking income and
              expenses.
            </p>
            <Link href="/dashboard/transactions" className={`${recipe.btnPrimaryLg} mt-5 inline-block`}>
              Add your first entry
            </Link>
            <p className={`mt-4 text-xs ${palette.textGhost}`}>
              {categoryCount} categories from your {activePreset} preset are ready.
            </p>
          </div>
        ) : (
          <OverviewView
            initial={buildSummary(
              withoutHiddenCategories(rows, hiddenIds).map(toLedgerEntry),
              "month",
              settings.taxRate ?? 23,
              settings.currencyDisplay ?? "USD",
            )}
            cards={cards}
          />
        )}
      </section>

      {!settings.onboarded && <TutorialOverlay />}
    </main>
  );
}