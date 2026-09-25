"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  LayoutDashboard,
  Settings,
  Upload,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { palette, type } from "@/lib/tokens";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/import", label: "Import", icon: Upload },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const path = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-2"
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-md text-white ${palette.cta} font-display text-sm font-semibold`}
          >
            S
          </span>
          <span className={`${type.brand} ${palette.text}`}>Set-Aside</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wide text-gray-500">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = item.exact
                  ? path === item.href
                  : path.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}