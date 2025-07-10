import { Factura, DetalleFacturaSinId } from "@/types/factura";

export const fetchFacturas = async (
  signal?: AbortSignal
): Promise<Factura[]> => {
  const response = await fetch("/api/facturas", { signal });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};

export const deleteFactura = async (id: number): Promise<boolean> => {
  const response = await fetch(`/api/facturas?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return true;
};

export const updateFactura = async (factura: Factura): Promise<Factura> => {
  console.log("Datos enviados a la API:", factura); // Log para depuración

  // Asegurarse de que los detalles tengan valores numéricos
  const detallesConNumeros = factura.detalles.map((detalle) => ({
    ...detalle,
    precioUnit: Number(detalle.precioUnit),
    descuento: Number(detalle.descuento),
    montoNeto: Number(detalle.montoNeto),
    cantidad: Number(detalle.cantidad),
  }));

  const facturaFormateada = {
    ...factura,
    detalles: detallesConNumeros,
  };

  const response = await fetch(`/api/facturas?id=${factura.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(facturaFormateada),
  });

  console.log("Respuesta de la API:", response); // Log para depuración

  if (!response.ok) {
    console.error("Error HTTP:", response.status, await response.text()); // Log detallado del error
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};

export const createFactura = async (factura: {
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
}): Promise<Factura> => {
  const response = await fetch("/api/facturas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(factura),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};
export const sendFactura = async (
  id: number,
  ambiente: string = "certificacion"
): Promise<any> => {
  const response = await fetch("/api/sii/enviar-factura", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ambiente }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error HTTP: ${response.status} - ${text}`);
  }

  return response.json();
};
