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

export const deleteProducto = async (id: number): Promise<boolean> => {
  const response = await fetch(`/api/productos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }
  return true;
};

export const updateProducto = async (producto: Producto): Promise<Producto> => {
  const { id, ...rest } = producto;
  const response = await fetch(`/api/productos/${id}`, {
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

export const createProducto = async (
  producto: Omit<Producto, "id">
): Promise<Producto> => {
  const response = await fetch("/api/productos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};
