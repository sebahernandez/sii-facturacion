import { DasboardHome } from "@/components/dasboard-home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Dashboard() {
  return <DasboardHome />;
}
