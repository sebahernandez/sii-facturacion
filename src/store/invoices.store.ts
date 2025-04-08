import { create } from "zustand";
import { fetchFacturas } from "@/lib/invoicesServices";
import type { Factura } from "@/types/factura";
import { toast } from "sonner";

interface InvoiceStore {
  facturas: Factura[] | null; // Array de facturas o null
  isLoading: boolean; // Indica si se está cargando
  fetchInvoices: (signal?: AbortSignal) => Promise<void>; // Función para cargar facturas
  eliminarFactura: (id: number, folio: number) => Promise<boolean>; // Función para eliminar una factura
  editarFactura: (factura: Factura) => Promise<boolean>; // Función para editar una factura
  setFacturas: (facturas: Factura[]) => void; // Función para establecer facturas
  resetFacturas: () => void; // Función para resetear facturas
}

// Implementación del store
const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  facturas: null,
  isLoading: false,

  // Función para cargar facturas
  fetchInvoices: async (signal?: AbortSignal) => {
    const { facturas, isLoading } = get();
    if (facturas || isLoading) return;

    set({ isLoading: true });
    try {
      const data: Factura[] = await fetchFacturas(signal);
      set({ facturas: data });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Fetch cancelado");
      } else {
        console.error("Error al cargar facturas:", error);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // Función para eliminar una factura
  eliminarFactura: async (id: number, folio: number) => {
    try {
      const res = await fetch(`/api/facturas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      // Actualiza facturas después de eliminar
      const { resetFacturas, fetchInvoices } = get();
      resetFacturas();
      await fetchInvoices();
      toast.success(`Factura N° ${folio} eliminada exitosamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar factura");
      return false;
    }
  },

  // Función para editar una factura
  editarFactura: async (factura) => {
    const { id, ...rest } = factura;
    try {
      const res = await fetch(`/api/facturas/${id}`, {
        method: "PUT",
        body: JSON.stringify(rest),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Error al editar");
      const { resetFacturas, fetchInvoices } = get();
      resetFacturas();
      await fetchInvoices();
      toast.success(`Factura N° ${factura.folio} editada exitosamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al editar factura");
      return false;
    }
  },

  // Función para establecer facturas
  setFacturas: (facturas: Factura[]) => set({ facturas }),

  // Función para resetear facturas
  resetFacturas: () => set({ facturas: null }),
}));

export default useInvoiceStore;
