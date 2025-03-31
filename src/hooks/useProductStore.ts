// useProductStore.ts
import { create } from "zustand";
import { fetchProductos } from "@/lib/productServices";
import type { Producto } from "@/types/producto";
import { toast } from "sonner";

interface ProductStore {
  productos: Producto[] | null;
  isLoading: boolean;
  fetchProducts: (signal?: AbortSignal) => Promise<void>;
  setProductos: (productos: Producto[]) => void;
  resetProductos: () => void;
  eliminarProducto: (id: number, nombre: string) => Promise<boolean>;
}

const useProductStore = create<ProductStore>((set, get) => ({
  productos: null,
  isLoading: false,

  fetchProducts: async (signal?: AbortSignal) => {
    const { productos, isLoading } = get();
    if (productos || isLoading) return;

    set({ isLoading: true });
    try {
      const data: Producto[] = await fetchProductos(signal);
      set({ productos: data });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Fetch cancelado");
      } else {
        console.error("Error al cargar productos:", error);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  eliminarProducto: async (id: number, nombre: string) => {
    try {
      const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Error al eliminar");

      // Actualiza productos después de eliminar
      const { resetProductos, fetchProducts } = get();
      resetProductos();
      await fetchProducts();
      toast.success(`Producto ${nombre} eliminado exitosamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar producto");
      return false;
    }
  },

  setProductos: (productos: Producto[]) => set({ productos }),
  resetProductos: () => set({ productos: null }),
}));

export default useProductStore;
