"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { SessionProvider } from "@/components/SessionProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SessionProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarTrigger />
          <main className="flex-1 p-6">
            <h1>soy el dashboard layout</h1>
            {children}
          </main>
        </SidebarProvider>
      </SessionProvider>
    </div>
  );
}
