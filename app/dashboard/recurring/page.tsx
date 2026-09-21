import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "../dashboard-header";
import { RecurringView, type TemplateRow } from "./recurring-view";

export default async function RecurringPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: settings }, { data: categories }, { data: templates }] =
    await Promise.all([
      supabase.from("Settings").select("id").eq("userId", user.id).maybeSingle(),
      supabase
        .from("Category")
        .select("id,name,type")
        .eq("userId", user.id)
        .order("sortOrder", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("Template")
        .select(
          "id,amountCents,dayOfMonth,startDate,endDate,note,active,categoryId,category:Category(name,type)",
        )
        .eq("userId", user.id)
        .order("dayOfMonth", { ascending: true })
        .order("createdAt", { ascending: true }),
    ]);

  if (!settings) redirect("/dashboard/onboarding");

  const rows: TemplateRow[] = (templates ?? []).map((t) => {
    const cat = Array.isArray(t.category) ? t.category[0] : t.category;
    return {
      id: t.id,
      amountCents: t.amountCents,
      dayOfMonth: t.dayOfMonth,
      startDate: t.startDate,
      endDate: t.endDate,
      note: t.note,
      active: t.active,
      categoryId: t.categoryId,
      category: cat ?? null,
    };
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardHeader email={user.email ?? ""} />
      <section className="mx-auto max-w-3xl px-6 py-10">
        <RecurringView templates={rows} categories={(categories ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
        }))} />
      </section>
    </main>
  );
}