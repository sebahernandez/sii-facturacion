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

export const deleteFactura = async (id: number): Promise<boolean> => {
  const response = await fetch(`/api/facturas/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return true;
};

export const updateFactura = async (factura: Factura): Promise<Factura> => {
  const { id, ...rest } = factura;
  const response = await fetch(`/api/facturas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};

export const createFactura = async (
  factura: Omit<Factura, "id" | "createdAt" | "updatedAt">
): Promise<Factura> => {
  const response = await fetch("/api/facturas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(factura),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};
