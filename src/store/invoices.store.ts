import { create } from "zustand";
import { toast } from "sonner";
import { Factura } from "@/types/factura";
import {
  fetchFacturas,
  deleteFactura,
  updateFactura,
} from "@/lib/invoicesServices";

interface InvoiceStore {
  facturas: Factura[] | null;
  isLoading: boolean;
  fetchInvoices: (signal?: AbortSignal) => Promise<void>;
  eliminarFactura: (id: number, folio: number) => Promise<boolean>;
  editarFactura: (factura: Factura) => Promise<boolean>;
  setFacturas: (facturas: Factura[]) => void;
  resetFacturas: () => void;
}

const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  facturas: null,
  isLoading: false,

  fetchInvoices: async (signal?: AbortSignal) => {
    const { facturas, isLoading } = get();
    if (facturas || isLoading) return;

    set({ isLoading: true });
    try {
      const data = await fetchFacturas(signal);
      set({ facturas: data });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Fetch cancelado");
      } else {
        console.error("Error al cargar facturas:", error);
        toast.error("Error al cargar las facturas");
      }
    } finally {
      set({ isLoading: false });
    }
  },

  eliminarFactura: async (id: number, folio: number) => {
    try {
      await deleteFactura(id);

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

  editarFactura: async (factura: Factura) => {
    try {
      await updateFactura(factura);

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

  setFacturas: (facturas: Factura[]) => set({ facturas }),
  resetFacturas: () => set({ facturas: null }),
}));

export default useInvoiceStore;
