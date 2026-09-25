import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ImportView } from "./import-view";
import { palette, space, type } from "@/lib/tokens";

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className={palette.canvas}>
      <section className={`${space.containerLg} py-10`}>
        <h1 className={type.heading + " " + palette.text}>Import transactions</h1>
        <p className={`mt-1 max-w-xl ${type.text} ${palette.textGhost}`}>
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