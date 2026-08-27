"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth"
import {
  Bell,
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
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog"

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
  currentWorkspace?: WorkspaceSummary | null;
}

// ---------- Demo data (swap out with real data) ----------

export const demoGeneralNavItems: SidebarNavItem[] = [
  { title: "Home", href: "/home", icon: Home },
  { title: "Settings", href: "/settings", icon: Settings },
];

function getWorkspaceNavItems(workspaceSlug: string): SidebarNavItem[] {
  return [
    { title: "Dashboard", href: `/${workspaceSlug}/dashboard`, icon: LayoutDashboard },
    { title: "Clients", href: `/${workspaceSlug}/clients`, icon: Users },
    { title: "Projects", href: `/${workspaceSlug}/projects`, icon: FolderKanban },
    { title: "Team", href: `/${workspaceSlug}/team`, icon: Users },
  ];
}

// ---------- Workspace switcher ----------

function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
}: {
  workspaces: WorkspaceSummary[];
  currentWorkspace: WorkspaceSummary | null | undefined;
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
              href={`/${workspace.slug}/dashboard`}
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
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()} // keeps the menu from closing before the dialog can open
        >
          <CreateWorkspaceDialog>
            <button className="flex w-full items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </button>
          </CreateWorkspaceDialog>
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
  currentWorkspace
}: AppSidebarProps) {
  const pathname = usePathname();

  // The current workspace is inferred from the URL (/[workspace]/...).
  // The URL segment is the workspace SLUG (see the Link hrefs below,
  // which route to `/${workspace.slug}/...`), so we must match against
  // `slug`, not `id`.
  const workspaceSlugInPath = pathname.match(/^\/([^/]+)\/(?:dashboard|projects|analytics|team)/)?.[1] ?? null;
  // const currentWorkspace =
  //   workspaces.find((w) => w.slug === workspaceSlugInPath) ?? null;

  const workspaceNavItems = currentWorkspace
    ? getWorkspaceNavItems(currentWorkspace.slug)
    : [];

  return (
    <Sidebar collapsible="icon" className="bg-background border-0 shadow-none">
      <SidebarHeader className="gap-2">
        <Link href="/home" className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="relative shrink-0 overflow-hidden rounded-md">
            <Image src="/assets/logo.svg" alt={brandName} width={230} height={95} />
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
                    <Link href={item.href} className=" font-bold">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span className="">{item.title}</span>
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
                      <Link href={item.href} className=" font-bold">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="font-bold text-lg"><SidebarMenuButton asChild><Link href="/settings/profile"><Users className="h-4 w-4" /> Profile</Link></SidebarMenuButton></SidebarMenuItem>
                <SidebarMenuItem className="font-bold text-lg"><SidebarMenuButton asChild><Link href="/settings/notifications"><Bell className="h-4 w-4" /> Notifications</Link></SidebarMenuButton></SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <button className="text-red-500 flex font-black w-full justify-end gap-1"
          onClick={signOut}>
          <LogOut /> Logout
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
