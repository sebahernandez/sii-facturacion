import { create } from "zustand";
import { toast } from "sonner";
import { Factura, DetalleFacturaSinId } from "@/types/factura";
import {
  fetchFacturas,
  deleteFactura,
  updateFactura,
  createFactura,
  sendFactura,
} from "@/lib/invoicesServices";

interface InvoiceStore {
  facturas: Factura[] | null;
  isLoading: boolean;
  fetchInvoices: (signal?: AbortSignal) => Promise<void>;
  eliminarFactura: (id: number) => Promise<boolean>;
  editarFactura: (factura: Factura) => Promise<boolean>;
  crearFactura: (factura: {
    tipoDTE: number;
    fechaEmision: Date;
    razonSocialEmisor: string;
    rutEmisor: string;
    rutReceptor: string;
    razonSocialReceptor: string;
    direccionReceptor: string;
    comunaReceptor: string;
    ciudadReceptor?: string;
    montoNeto: number;
    iva: number;
    montoTotal: number;
    estado: string;
    observaciones?: string;
    user_id: string;
    detalles: DetalleFacturaSinId[];
  }) => Promise<Factura | null>;
  enviarFactura: (id: number, password: string) => Promise<boolean>;
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

  eliminarFactura: async (id: number) => {
    try {
      await deleteFactura(id);

      const { resetFacturas, fetchInvoices } = get();
      resetFacturas();
      await fetchInvoices();

      toast.success(`Factura #${id} eliminada exitosamente`);
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

      toast.success(`Factura #${factura.id} editada exitosamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al editar factura");
      return false;
    }
  },

  crearFactura: async (factura: {
    tipoDTE: number;
    fechaEmision: Date;
    razonSocialEmisor: string;
    rutEmisor: string;
    rutReceptor: string;
    razonSocialReceptor: string;
    direccionReceptor: string;
    comunaReceptor: string;
    ciudadReceptor?: string;
    montoNeto: number;
    iva: number;
    montoTotal: number;
    estado: string;
    observaciones?: string;
    user_id: string;
    detalles: DetalleFacturaSinId[];
  }) => {
    try {
      const nuevaFactura = await createFactura(factura);

      const { resetFacturas, fetchInvoices } = get();
      resetFacturas();
      await fetchInvoices();

      toast.success(`Factura #${nuevaFactura.id} creada exitosamente`);
      return nuevaFactura;
    } catch (error) {
      console.error(error);
      toast.error("Error al crear factura");
      return null;
    }
  },

  enviarFactura: async (id: number, password: string) => {
    try {
      await sendFactura(id, password);

      const { resetFacturas, fetchInvoices } = get();
      resetFacturas();
      await fetchInvoices();

      toast.success(`Factura #${id} enviada correctamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar factura");
      return false;
    }
  },

  setFacturas: (facturas: Factura[]) => set({ facturas }),
  resetFacturas: () => set({ facturas: null }),
}));

export default useInvoiceStore;
