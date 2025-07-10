import { redirect } from "next/navigation";

export const metadata = {
  title: "Facturación Electrónica",
  description: "Plataforma de facturación electrónica simple y eficiente",
};

export default function HomePage() {
  // Redirigir automáticamente a la página de login
  redirect("/auth/login");
}
