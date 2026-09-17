import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PresetPicker } from "./preset-picker";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("Settings")
    .select("id")
    .eq("userId", user.id)
    .maybeSingle();

  if (settings) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Welcome to Set-Aside
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Pick a starting point — you can rename, add, or hide categories later in Settings.
          </p>
        </header>
        <PresetPicker />
      </div>
    </main>
  );
}