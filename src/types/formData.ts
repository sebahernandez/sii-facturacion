import { DetalleFacturaSinId } from "./factura";

export interface FormData {
  tipoDTE: number;
  fechaEmision: string;
  rutReceptor: string;
  razonSocialReceptor: string;
  direccionReceptor: string;
  comunaReceptor: string;
  contactoReceptor?: string;
  observaciones?: string;
  montoNeto: number;
  iva: number;
  montoTotal: number;
  estado: "EMITIDA" | "NO_ENVIADA" | "ENVIADA" | "ANULADA";
  detalles: DetalleFacturaSinId[];
}
