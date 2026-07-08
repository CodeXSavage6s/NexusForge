"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronsUpDown,
  Check,
  Plus,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---------- Types ----------

export interface SidebarNavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

export interface AppSidebarProps {
  brandName?: string;
  /** Leave empty ("") and swap in a real logo path/URL when wiring this up. */
  logoSrc?: string;
  /** Links that are always visible, regardless of workspace. */
  navItems?: SidebarNavItem[];
  /** Every workspace the current user can switch into. */
  workspaces?: WorkspaceSummary[];
}

// ---------- Demo data (swap out with real data) ----------

export const demoGeneralNavItems: SidebarNavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Settings", href: "/settings", icon: Settings },
];

function getWorkspaceNavItems(workspaceId: string): SidebarNavItem[] {
  return [
    { title: "Dashboard", href: `/workspace/${workspaceId}`, icon: LayoutDashboard },
    { title: "Projects", href: `/workspace/${workspaceId}/projects`, icon: FolderKanban },
    { title: "Analytics", href: `/workspace/${workspaceId}/analytics`, icon: BarChart3 },
    { title: "Team", href: `/workspace/${workspaceId}/team`, icon: Users },
  ];
}

// ---------- Workspace switcher ----------

function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
}: {
  workspaces: WorkspaceSummary[];
  currentWorkspace: WorkspaceSummary | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className="justify-between"
          tooltip={currentWorkspace?.name ?? "Select workspace"}
        >
          <span className="truncate text-sm font-medium">
            {currentWorkspace ? currentWorkspace.name : "Select workspace"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {workspaces.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            No workspaces yet
          </p>
        )}

        {workspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.id} asChild>
            <Link
              href={`/workspace/${workspace.id}`}
              className="flex items-center justify-between"
            >
              <span className="truncate">{workspace.name}</span>
              {currentWorkspace?.id === workspace.id && (
                <Check className="h-4 w-4" />
              )}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------- Component ----------

export function AppSidebar({
  brandName = "",
  logoSrc = "",
  navItems = demoGeneralNavItems,
  workspaces = [],
}: AppSidebarProps) {
  const pathname = usePathname();

  // The current workspace is inferred from the URL (/workspace/[id]/...),
  // so the layout only needs to pass the full workspace list down once.
  const workspaceIdInPath = pathname.match(/^\/workspace\/([^/]+)/)?.[1] ?? null;
  const currentWorkspace =
    workspaces.find((w) => w.id === workspaceIdInPath) ?? null;

  const workspaceNavItems = currentWorkspace
    ? getWorkspaceNavItems(currentWorkspace.id)
    : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-2">
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="relative shrink-0 overflow-hidden rounded-md">
            <Image src={logoSrc} alt={brandName} width={230} height={95} />
          </span>
          <span className="text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            {brandName}
          </span>
        </Link>

        <SidebarMenu>
          <SidebarMenuItem>
            <WorkspaceSwitcher
              workspaces={workspaces}
              currentWorkspace={currentWorkspace}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.href}
                  >
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

        {currentWorkspace && (
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-2">
                {workspaceNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.href}
                    >
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
        )}
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
