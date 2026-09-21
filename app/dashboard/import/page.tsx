import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "../dashboard-header";
import { ImportView } from "./import-view";

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-50">
      <DashboardHeader email={user.email ?? ""} />
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-xl font-semibold text-gray-900">Import transactions</h1>
        <p className="mt-1 max-w-xl text-sm text-gray-500">
          Upload a CSV or Excel file, map your columns, and review every row
          before anything is written. Blocked rows are never silently altered.
        </p>
        <div className="mt-6">
          <ImportView email={user.email ?? ""} />
        </div>
      </section>
    </main>
  );
}