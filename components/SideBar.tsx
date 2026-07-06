"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Users,
  Settings,
  LogOut
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// ---------- Types ----------

export interface SidebarNavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface AppSidebarProps {
  brandName?: string;
  /** Leave empty ("") and swap in a real logo path/URL when wiring this up. */
  logoSrc?: string;
  navItems?: SidebarNavItem[];
}

// ---------- Demo data (swap out with real data) ----------

export const demoSidebarNavItems: SidebarNavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Team", href: "/team", icon: Users },
  { title: "Settings", href: "/settings", icon: Settings },
];

// ---------- Component ----------

export function AppSidebar({
  brandName = "",
  logoSrc = "",
  navItems = demoSidebarNavItems,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="relative shrink-0 overflow-hidden rounded-md">
            <Image src={logoSrc} alt={brandName} width={230} height={95} />
          </span>
          <span className="text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            {brandName}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.href} className="text-2xl font-bold">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span className="text-xl">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="text-red-500 flex font-black w-full justify-end gap-1">
          <LogOut /> Logout
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
