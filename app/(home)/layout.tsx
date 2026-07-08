import type { Metadata } from "next";
import Header from "@/components/header";
import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip"; 
import { demoUser, demoMenuItems, demoNavLinks } from "@/lib/constants/header-constants.tsx"
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import { UnreadNotificationsCount } from '@/lib/actions/notifications'
import { getUserWorkspaces } from '@/lib/actions/workspace'

export const metadata: Metadata = {
  title: "NexusForge",
  description: "NexusForge dashboard",
};


export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
  
      if(!session?.user) redirect('/sign-in');
      
      const user = session?.user
      const count = await UnreadNotificationsCount(user.id)
      const workspaces = await getUserWorkspaces(user.id)
  return (
      <div className="min-h-screen">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar logoSrc="/assets/logo.svg" brandName="" workspaces={workspaces} />
            <SidebarInset>
              <Header
                logoSrc="/assets/logo.svg"
                navLinks={demoNavLinks}
                notificationCount={count}
                user={user}
                menuItems={demoMenuItems}
              />
              <main className="p-2">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </div>
  );
}
