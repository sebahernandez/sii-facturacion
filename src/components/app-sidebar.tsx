"use client";

import { PackageSearch, Home, Inbox, Settings, UsersRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

const user = {
  name: "Juan Perez",
  email: "j@example.com",
  avatar: "https://randomuser.me/api/portraits/thumb/men/75.jpg",
};

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
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
