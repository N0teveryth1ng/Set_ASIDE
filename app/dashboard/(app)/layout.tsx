import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardAccountBar } from "@/components/dashboard-account-bar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardAccountBar email={user.email ?? ""} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}