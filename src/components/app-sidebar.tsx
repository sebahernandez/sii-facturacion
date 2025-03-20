"use client";

import { PackageSearch, Home, Inbox, Settings, UsersRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSession, signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { ModeToggle } from "./mode-toggle";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Facturas",
    url: "/dashboard/facturas",
    icon: Inbox,
  },
  {
    title: "Productos",
    url: "/dashboard/productos",
    icon: PackageSearch,
  },
  {
    title: "Clientes",
    url: "/dashboard/clientes",
    icon: UsersRound,
  },
  {
    title: "Configuracion",
    url: "/dashboard/configuracion",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Sidebar>
      <SidebarHeader>Facturapp</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  <Separator />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        {user && <NavUser user={user} signout={signOut} />}
      </SidebarFooter>
    </Sidebar>
  );
}
