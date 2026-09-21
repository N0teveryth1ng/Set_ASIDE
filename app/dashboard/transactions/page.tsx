import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { embedToCategory } from "@/lib/ledger/mapping";
import { DashboardHeader } from "../dashboard-header";
import { TransactionsView } from "./transactions-view";
import type { EntryRow, CategoryOption } from "./types";
import { palette, space } from "@/lib/tokens";

interface RawEntryRow {
  id: string;
  amountCents: number;
  date: string;
  note: string | null;
  source: string | null;
  category?: unknown;
}

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: entries }, { data: categories }, { data: settings }] = await Promise.all([
    supabase
      .from("Entry")
      .select("id,amountCents,date,note,source,createdAt,category:Category(id,name,type)")
      .eq("userId", user.id)
      .order("date", { ascending: false })
      .order("createdAt", { ascending: false }),
    supabase
      .from("Category")
      .select("id,name,type,hidden,sortOrder")
      .eq("userId", user.id)
      .order("sortOrder", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("Settings").select("currencyDisplay").eq("userId", user.id).maybeSingle(),
  ]);

  const rows: EntryRow[] = (entries ?? ([] as RawEntryRow[])).map((e) => ({
    id: e.id,
    amountCents: e.amountCents,
    date: e.date,
    note: e.note,
    source: e.source,
    category: embedToCategory(e.category),
  }));

  // Hidden categories are removed from the breakdown/totals; they don't appear
  // in the entry form either (existing entries keep their link and render by name).
  const visibleCategories = (categories ?? []).filter((c) => !c.hidden) as CategoryOption[];

  return (
    <main className={palette.canvas + " min-h-screen"}>
      <DashboardHeader email={user.email ?? ""} />
      <section className={`${space.containerLg} py-10`}>
        <TransactionsView
          entries={rows}
          categories={visibleCategories}
          currency={settings?.currencyDisplay ?? "USD"}
        />
      </section>
    </main>
  );
}