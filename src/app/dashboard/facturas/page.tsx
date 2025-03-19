import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facturapp - Facturas electrónicas",
  description: "Lista de facturas electrónicas.",
};

export default function FacturasPage() {
  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Facturas</h1>
      <p>Aquí podrás consultar y administrar las facturas electrónicas.</p>
    </div>
  );
}
