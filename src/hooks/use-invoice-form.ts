import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceInput } from "@/lib/zod";

/**
 * Hook personalizado para manejar el formulario de factura
 * @returns Objeto con métodos auxiliares para el formulario
 */
export const useInvoiceForm = () => {
  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      tipoDTE: 33,
      rutReceptor: "",
      razonSocialReceptor: "",
      direccionReceptor: "",
      comunaReceptor: "",
      contactoReceptor: "",
      fechaEmision: new Date().toISOString().split("T")[0],
      montoNeto: 0,
      iva: 0,
      montoTotal: 0,
      estado: "NO_ENVIADA",
      detalles: [],
    },
    mode: "onChange",
  });

  const calcularMontos = useCallback(
    (montoNeto: number) => {
      const iva = Math.round(montoNeto * 0.19);
      const total = montoNeto + iva;

      form.setValue("montoNeto", montoNeto);
      form.setValue("iva", iva);
      form.setValue("montoTotal", total);
    },
    [form]
  );

  return {
    ...form,
    calcularMontos,
  };
};
