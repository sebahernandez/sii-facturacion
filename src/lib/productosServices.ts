import { toast } from "sonner";
import { Producto } from "@/types/producto";

export const fetchProductos = async (
  setProductos: (productos: Producto[]) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    setIsLoading(true);
    const res = await fetch("/api/productos");
    if (!res.ok) {
      throw new Error("Error al obtener productos");
    }
    const data = await res.json();
    setProductos(data);
  } catch (e) {
    console.error(e);
    toast.error("Error al obtener productos");
  } finally {
    setIsLoading(false);
  }
};
