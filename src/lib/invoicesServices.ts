import { Factura } from "@/types/factura";

export const fetchFacturas = async (
  signal?: AbortSignal
): Promise<Factura[]> => {
  const response = await fetch("/api/facturas", { signal });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};
