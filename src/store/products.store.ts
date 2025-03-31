// useProductStore.ts
import { create } from "zustand";
import { fetchProductos } from "@/lib/productServices";
import type { Producto } from "@/types/producto";
import { toast } from "sonner";

interface ProductStore {
  productos: Producto[] | null; // Array de productos o null
  isLoading: boolean; // Indica si se está cargando
  fetchProducts: (signal?: AbortSignal) => Promise<void>; // Función para cargar productos
  setProductos: (productos: Producto[]) => void; // Función para establecer productos
  resetProductos: () => void; // Función para resetear productos
  eliminarProducto: (id: number, nombre: string) => Promise<boolean>; // Función para eliminar un producto
  editarProducto: (producto: Producto) => Promise<boolean>;
}

// Implementación del store
const useProductStore = create<ProductStore>((set, get) => ({
  productos: null, // Array de productos o null
  isLoading: false, // Indica si se está cargando

  // Función para cargar productos
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

  // Función para eliminar un producto
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

  editarProducto: async (producto) => {
    const { id, ...rest } = producto;
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(rest),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Error al editar");
      const { resetProductos, fetchProducts } = get();
      resetProductos();
      await fetchProducts();
      toast.success(`Producto ${producto.descripcion} editado exitosamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al editar producto");
      return false;
    }
  },

  // Función para establecer productos
  setProductos: (productos: Producto[]) => set({ productos }),
  // Función para resetear productos
  resetProductos: () => set({ productos: null }),
}));

export default useProductStore;
