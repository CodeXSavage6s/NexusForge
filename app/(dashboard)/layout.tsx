import type { Metadata } from "next";
import Header from "@/components/header";
import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip"; 
import { demoUser, demoMenuItems, demoNavLinks } from "@/lib/constants/header-constants.tsx"

export const metadata: Metadata = {
  title: "NexusForge",
  description: "NexusForge dashboard",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar logoSrc="/assets/logo.svg" brandName="" />
            <SidebarInset>
              <Header
                logoSrc="/assets/logo.svg"
                navLinks={demoNavLinks}
                notificationCount={3}
                user={demoUser}
                menuItems={demoMenuItems}
              />
              <main className="p-2">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </div>
  );
}
