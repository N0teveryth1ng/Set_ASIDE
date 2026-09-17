import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "../dashboard-header";
import { TransactionsView } from "./transactions-view";
import type { EntryRow, CategoryOption } from "./types";

interface RawEntryRow extends Omit<EntryRow, "category"> {
  category:
    | { id: string; name: string; type: "IN" | "OUT" }
    | { id: string; name: string; type: "IN" | "OUT" }[]
    | null;
}

function embedToCategory(
  embed: RawEntryRow["category"],
): { id: string; name: string; type: "IN" | "OUT" } | null {
  if (!embed) return null;
  return Array.isArray(embed) ? (embed[0] ?? null) : embed;
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
    supabase.from("Category").select("id,name,type").eq("userId", user.id).order("name"),
    supabase.from("Settings").select("currencyDisplay").eq("userId", user.id).maybeSingle(),
  ]);

  const rows: EntryRow[] = (entries ?? ([] as RawEntryRow[])).map((e) => ({
    id: e.id,
    amountCents: e.amountCents,
    date: e.date,
    note: e.note,
    source: e.source,
    category: embedToCategory(e.category as RawEntryRow["category"]),
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardHeader email={user.email ?? ""} />
      <section className="mx-auto max-w-4xl px-6 py-10">
        <TransactionsView
          entries={rows}
          categories={(categories ?? []) as CategoryOption[]}
          currency={settings?.currencyDisplay ?? "USD"}
        />
      </section>
    </main>
  );
}