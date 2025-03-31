import "./globals.css";

export const metadata = {
  title: "Facturación Electrónica",
  description: "Plataforma de facturación electrónica simple y eficiente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
