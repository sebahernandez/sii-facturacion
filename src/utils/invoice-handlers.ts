import { Producto } from "@/types/producto";
import { Detalles } from "@/types/detalles";
import { UseFormSetValue } from "react-hook-form";

// Define the form data type to match the actual form structure
interface InvoiceFormData {
  montoNeto: number;
  detalles: {
    cantidad: number;
    descripcion: string;
    precioUnit: number;
    descuento: number;
    montoNeto: number;
  }[];
  tipoDTE: number;
  fechaEmision: string;
  rutReceptor: string;
  razonSocialReceptor: string;
  direccionReceptor: string;
  comunaReceptor: string;
  contactoReceptor?: string;
  observaciones?: string;
  iva: number;
  montoTotal: number;
  estado: "EMITIDA" | "NO_ENVIADA" | "ENVIADA" | "ANULADA";
}

export const handleProductoSelect = (
  producto: Producto,
  detalles: Detalles[],
  productoCantidad: number,
  setDetalles: React.Dispatch<React.SetStateAction<Detalles[]>>,
  setValue: UseFormSetValue<InvoiceFormData>,
  setProductoCantidad: React.Dispatch<React.SetStateAction<number>>,
  setItemsAccordionOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Verificar si el producto ya existe en los detalles
  const existe = detalles.find((d) => d.descripcion === producto.descripcion);
  if (existe) {
    // Si existe, actualizar la cantidad
    const nuevosDetalles = detalles.map((d) => {
      if (d.descripcion === producto.descripcion) {
        const nuevaCantidad = d.cantidad + productoCantidad;
        const montoNeto = nuevaCantidad * Number(producto.precioUnitario);
        return {
          ...d,
          cantidad: nuevaCantidad,
          montoNeto,
        };
      }
      return d;
    });
    setDetalles(nuevosDetalles);
  } else {
    // Si no existe, agregar nuevo detalle
    const montoNeto = productoCantidad * producto.precioUnitario;
    const nuevoDetalle: Detalles = {
      descripcion: producto.descripcion,
      cantidad: productoCantidad,
      precioUnit: producto.precioUnitario.toString(),
      descuento: "0",
      montoNeto,
    };
    setDetalles([...detalles, nuevoDetalle]);
  }

  // Actualizar montos totales
  const nuevoMontoNeto = detalles.reduce((acc, det) => acc + det.montoNeto, 0);
  setValue("montoNeto", nuevoMontoNeto);

  // Resetear cantidad y abrir acordeón de items
  setProductoCantidad(1);
  setItemsAccordionOpen(true);
};

export const handleRemoveDetalle = (
  descripcionProducto: string,
  detalles: Detalles[],
  setDetalles: React.Dispatch<React.SetStateAction<Detalles[]>>,
  setValue: UseFormSetValue<InvoiceFormData>
) => {
  const nuevosDetalles = detalles.filter(
    (d) => d.descripcion !== descripcionProducto
  );
  setDetalles(nuevosDetalles);

  // Actualizar montos totales
  const nuevoMontoNeto = nuevosDetalles.reduce(
    (acc, det) => acc + det.montoNeto,
    0
  );
  setValue("montoNeto", nuevoMontoNeto);
};

export const handleDetalleChange = (
  descripcion: string,
  field: keyof Detalles,
  value: string | number,
  detalles: Detalles[],
  setDetalles: React.Dispatch<React.SetStateAction<Detalles[]>>,
  setValue: UseFormSetValue<InvoiceFormData>
) => {
  // Asegurarse de que value sea string o number, no un objeto vacío
  if (typeof value === "object") {
    // Si value es un objeto vacío, convertirlo a string vacío
    value = "";
  }

  const nuevosDetalles = detalles.map((detalle) => {
    if (detalle.descripcion === descripcion) {
      const nuevoDetalle = { ...detalle, [field]: value };

      // Recalcular montoNeto si se cambió cantidad, precioUnit o descuento
      if (
        field === "cantidad" ||
        field === "precioUnit" ||
        field === "descuento"
      ) {
        const cantidad = Number(
          field === "cantidad" ? value : nuevoDetalle.cantidad
        );
        const precioUnit = Number(
          field === "precioUnit" ? value : nuevoDetalle.precioUnit
        );
        const descuento = Number(
          field === "descuento" ? value : nuevoDetalle.descuento
        );
        const montoNeto = cantidad * precioUnit * (1 - descuento / 100);
        nuevoDetalle.montoNeto = montoNeto;
      }

      return nuevoDetalle;
    }
    return detalle;
  });

  setDetalles(nuevosDetalles);

  // Actualizar montos totales
  const nuevoMontoNeto = nuevosDetalles.reduce(
    (acc, det) => acc + det.montoNeto,
    0
  );
  setValue("montoNeto", nuevoMontoNeto);
};
