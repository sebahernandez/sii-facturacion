// useProductStore.ts
import { create } from "zustand";
import { toast } from "sonner";
import { Producto } from "@/types/producto";
import {
  fetchProductos,
  deleteProducto,
  updateProducto,
} from "@/lib/productServices";

interface ProductStore {
  productos: Producto[] | null;
  isLoading: boolean;
  fetchProducts: (signal?: AbortSignal) => Promise<void>;
  eliminarProducto: (id: number, descripcion: string) => Promise<boolean>;
  editarProducto: (producto: Producto) => Promise<boolean>;
  setProductos: (productos: Producto[]) => void;
  resetProductos: () => void;
}

const useProductStore = create<ProductStore>((set, get) => ({
  productos: null,
  isLoading: false,

  fetchProducts: async (signal?: AbortSignal) => {
    const { productos, isLoading } = get();
    if (productos || isLoading) return;

    set({ isLoading: true });
    try {
      const data = await fetchProductos(signal);
      set({ productos: data });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Fetch cancelado");
      } else {
        console.error("Error al cargar productos:", error);
        toast.error("Error al cargar los productos");
      }
    } finally {
      set({ isLoading: false });
    }
  },

  eliminarProducto: async (id: number, descripcion: string) => {
    try {
      await deleteProducto(id);

      const { resetProductos, fetchProducts } = get();
      resetProductos();
      await fetchProducts();

      toast.success(`Producto ${descripcion} eliminado exitosamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar producto");
      return false;
    }
  },

  editarProducto: async (producto: Producto) => {
    try {
      await updateProducto(producto);

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

  setProductos: (productos: Producto[]) => set({ productos }),
  resetProductos: () => set({ productos: null }),
}));

export default useProductStore;
