import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PresetPicker } from "./preset-picker";
import { palette, space, type } from "@/lib/tokens";

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
    <main className={`min-h-screen ${palette.canvas}`}>
      <div className={space.containerMd + " py-12"}>
        <header className="mb-10 text-center">
          <h1 className={`text-2xl font-semibold tracking-tight ${palette.text}`}>
            Welcome to Set-Aside
          </h1>
          <p className={`mt-2 text-sm ${palette.textFaint}`}>
            Pick a starting point — you can rename, add, or hide categories later in Settings.
          </p>
        </header>
        <PresetPicker />
      </div>
    </main>
  );
}