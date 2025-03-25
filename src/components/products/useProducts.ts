// useProductos.ts
import { useEffect, useState } from "react";
import { Producto } from "@/types/producto";
import { fetchProductos } from "@/lib/productosServices";
import { toast } from "sonner";

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargarProductos = () => fetchProductos(setProductos, setIsLoading);

  useEffect(() => {
    cargarProductos();
  }, []);

  const eliminarProducto = async (id: number) => {
    const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("Producto eliminado");
      cargarProductos();
    } else {
      toast.error("Error al eliminar producto");
    }
  };

  return {
    productos,
    isLoading,
    eliminarProducto,
    recargarProductos: cargarProductos,
  };
};
