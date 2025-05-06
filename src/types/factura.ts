export interface DetalleFactura {
  id: number;
  cantidad: number;
  descripcion: string;
  precioUnit: number;
  descuento: number;
  montoNeto: number;
  factura_id: number;
}

export type DetalleFacturaSinId = Omit<DetalleFactura, "id" | "factura_id">;

export interface Factura {
  id: number;
  tipoDTE: number;
  fechaEmision: Date;
  razonSocialEmisor: string;
  rutEmisor: string;
  rutReceptor: string;
  razonSocialReceptor: string;
  direccionReceptor: string;
  comunaReceptor: string;
  contactoReceptor?: string;
  ciudadReceptor?: string;
  montoNeto: number;
  iva: number;
  montoTotal: number;
  estado: string;
  observaciones?: string;
  user_id: string;
  detalles: DetalleFactura[];
  createdAt: Date;
  updatedAt: Date;
}

export type FacturaCreate = {
  tipoDTE: number;
  fechaEmision: Date;
  razonSocialEmisor: string;
  rutEmisor: string;
  rutReceptor: string;
  razonSocialReceptor: string;
  direccionReceptor: string;
  comunaReceptor: string;
  ciudadReceptor?: string;
  contactoReceptor?: string;
  montoNeto: number;
  iva: number;
  montoTotal: number;
  estado: string;
  observaciones?: string;
  user_id: string;
  detalles: DetalleFacturaSinId[];
};
