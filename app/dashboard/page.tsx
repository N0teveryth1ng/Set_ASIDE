import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TutorialOverlay } from "./tutorial-overlay";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("Settings")
    .select("*")
    .eq("userId", user.id)
    .maybeSingle();

  if (!settings) redirect("/dashboard/onboarding");

  const { count: entryCount } = await supabase
    .from("Entry")
    .select("id", { count: "exact", head: true })
    .eq("userId", user.id);

  const { data: categories } = await supabase
    .from("Category")
    .select("name")
    .eq("userId", user.id);

  const empty = (entryCount ?? 0) === 0;
  const categoryCount = categories?.length ?? 0;
  const activePreset = settings.activePreset ?? "Custom";

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Set-Aside</h1>
          <p className="text-sm text-gray-500">Overview</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-500 sm:inline">
            Signed in as{" "}
            <span className="font-medium text-gray-900">{user.email}</span>
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
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
            <p className="mt-4 text-xs text-gray-400">
              {categoryCount} categories from your {activePreset} preset are ready.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border bg-white px-6 py-10 shadow-sm">
            <p className="text-sm text-gray-600">
              {entryCount} entr{entryCount === 1 ? "y" : "ies"} · {categoryCount}{" "}
              categor{categoryCount === 1 ? "y" : "ies"}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              The full Overview — net position, money in/out, and tax set-aside —
              lands in the next phase.
            </p>
          </div>
        )}
      </section>

      {!settings.onboarded && <TutorialOverlay />}
    </main>
  );
}