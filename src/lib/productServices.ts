import { Producto } from "@/types/producto";

export const fetchProductos = async (
  signal?: AbortSignal
): Promise<Producto[]> => {
  const response = await fetch("/api/productos", { signal });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};
