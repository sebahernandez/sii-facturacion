"use client";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SessionProvider as Provider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { initializeAuthStore } from "@/hooks/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize auth store
  useEffect(() => {
    initializeAuthStore();
  }, []);

  return (
    <div className="flex">
      <Toaster richColors />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Provider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <div className="flex-1">{children}</div>
          </SidebarProvider>
        </Provider>
      </ThemeProvider>
    </div>
  );
}
