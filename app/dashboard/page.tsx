import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toLedgerEntry } from "@/lib/ledger/mapping";
import { buildSummary } from "@/lib/summary";
import { DashboardHeader } from "./dashboard-header";
import { TutorialOverlay } from "./tutorial-overlay";
import { OverviewView } from "./overview-view";

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
    supabase.from("Category").select("name").eq("userId", user.id),
  ]);

  if (!settings) redirect("/dashboard/onboarding");

  const rows = entries ?? [];
  const empty = rows.length === 0;
  const categoryCount = categories?.length ?? 0;
  const activePreset = settings.activePreset ?? "Custom";

  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardHeader email={user.email ?? ""} />

      <section className="mx-auto max-w-5xl px-6 py-10">
        {empty ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📒
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Your ledger is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Add your first entry or import a file to start tracking income and
              expenses.
            </p>
            <Link
              href="/dashboard/transactions"
              className="mt-5 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              Add your first entry
            </Link>
            <p className="mt-4 text-xs text-gray-400">
              {categoryCount} categories from your {activePreset} preset are ready.
            </p>
          </div>
        ) : (
          <OverviewView
            initial={buildSummary(
              rows.map(toLedgerEntry),
              "month",
              settings.taxRate ?? 23,
              settings.currencyDisplay ?? "USD",
            )}
          />
        )}
      </section>

      {!settings.onboarded && <TutorialOverlay />}
    </main>
  );
}