import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Set-Aside</h1>
          <p className="text-sm text-gray-500">Dashboard</p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </header>
      <section className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-gray-500">
          Signed in as <span className="font-medium text-gray-900">{user.email}</span>
        </p>
        <p className="mt-2 text-xs text-gray-400">uid: {user.id}</p>
        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Protected route shell — Phase 2 auth gate active.</p>
        </div>
      </section>
    </main>
  );
}