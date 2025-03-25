export interface Producto {
  id: number;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number;
  descuento: number;
  montoNeto: number;
  iva: number;
  montoTotal: number;
}
