import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUserFromCookie } from "@/lib/supabase/session";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardAccountBar } from "@/components/dashboard-account-bar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUserFromCookie();
  if (!user) redirect("/login");

  const cookieStore = cookies();
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardAccountBar email={user.email ?? ""} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}