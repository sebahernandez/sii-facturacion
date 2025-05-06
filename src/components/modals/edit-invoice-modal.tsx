"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceInput } from "@/lib/zod";

interface Detalle {
  id?: number;
  factura_id?: number;
  montoNeto: number;
  cantidad: number;
  descripcion: string;
  precioUnit: number;
  descuento: number;
}
import { Factura } from "@/types/factura";
import { toast } from "sonner";
import { formatRut } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useInvoiceStore from "@/store/invoices.store";
import { useSearchParams, useRouter } from "next/navigation";

interface EditInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  factura: Factura;
  onSuccess: () => void;
}

export default function InvoiceEditModal({
  open,
  onClose,
  factura,
  onSuccess,
}: EditInvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const editarFactura = useInvoiceStore((state) => state.editarFactura);
  const searchParams = useSearchParams();
  const router = useRouter();
  const facturaId = searchParams.get("id");

  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      tipoDTE: factura.tipoDTE,
      rutReceptor: factura.rutReceptor,
      razonSocialReceptor: factura.razonSocialReceptor,
      direccionReceptor: factura.direccionReceptor,
      comunaReceptor: factura.comunaReceptor,
      contactoReceptor: factura.contactoReceptor || "",
      observaciones: factura.observaciones || "",
      montoNeto:
        typeof factura.montoNeto === "string"
          ? parseFloat(factura.montoNeto)
          : factura.montoNeto,
      iva:
        typeof factura.iva === "string" ? parseFloat(factura.iva) : factura.iva,
      montoTotal:
        typeof factura.montoTotal === "string"
          ? parseFloat(factura.montoTotal)
          : factura.montoTotal,
      estado: factura.estado as
        | "EMITIDA"
        | "NO_ENVIADA"
        | "ENVIADA"
        | "ANULADA",
      fechaEmision:
        factura.fechaEmision instanceof Date
          ? factura.fechaEmision.toISOString().split("T")[0]
          : new Date(factura.fechaEmision).toISOString().split("T")[0],
      detalles: factura.detalles || [],
    },
  });

  // Efecto para actualizar los valores del formulario cuando cambia la factura
  useEffect(() => {
    if (factura) {
      // Asegurarse de que los campos de detalles sean números
      const detallesConvertidos =
        factura.detalles?.map((detalle) => ({
          ...detalle,
          precioUnit: Number(detalle.precioUnit),
          descuento: Number(detalle.descuento),
          montoNeto: Number(detalle.montoNeto),
        })) || [];

      form.reset({
        tipoDTE: factura.tipoDTE,
        rutReceptor: factura.rutReceptor,
        razonSocialReceptor: factura.razonSocialReceptor,
        direccionReceptor: factura.direccionReceptor,
        comunaReceptor: factura.comunaReceptor,
        contactoReceptor: factura.contactoReceptor || "",
        observaciones: factura.observaciones || "",
        montoNeto:
          typeof factura.montoNeto === "string"
            ? parseFloat(factura.montoNeto)
            : factura.montoNeto,
        iva:
          typeof factura.iva === "string"
            ? parseFloat(factura.iva)
            : factura.iva,
        montoTotal:
          typeof factura.montoTotal === "string"
            ? parseFloat(factura.montoTotal)
            : factura.montoTotal,
        estado: factura.estado as
          | "EMITIDA"
          | "NO_ENVIADA"
          | "ENVIADA"
          | "ANULADA",
        fechaEmision:
          factura.fechaEmision instanceof Date
            ? factura.fechaEmision.toISOString().split("T")[0]
            : new Date(factura.fechaEmision).toISOString().split("T")[0],
        detalles: detallesConvertidos,
      });
    }
  }, [factura, form]);

  const recalcularMontos = (montoNeto: number) => {
    const iva = montoNeto * 0.19;
    const montoTotal = montoNeto + iva;

    form.setValue("iva", iva);
    form.setValue("montoTotal", montoTotal);
  };

  const onSubmit = async (data: InvoiceInput) => {
    console.log("Formulario enviado con datos:", data); // Log para depuración

    if (!facturaId) {
      console.error("Error: ID de factura no proporcionado"); // Log de error
      toast.error("ID de factura no proporcionado");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Enviando datos al servidor..."); // Log para depuración

      // Convertir los valores de detalles a números
      const detallesTransformados = (data.detalles as Detalle[]).map(
        (detalle) => ({
          ...detalle,
          id: detalle.id || 0,
          factura_id: detalle.factura_id || parseInt(facturaId),
          descuento: Number(detalle.descuento),
          montoNeto: Number(detalle.montoNeto),
          precioUnit: Number(detalle.precioUnit),
        })
      );

      const success = await editarFactura({
        ...factura,
        tipoDTE: data.tipoDTE,
        rutReceptor: data.rutReceptor,
        razonSocialReceptor: data.razonSocialReceptor,
        direccionReceptor: data.direccionReceptor,
        comunaReceptor: data.comunaReceptor,
        contactoReceptor: data.contactoReceptor,
        observaciones: data.observaciones,
        montoNeto: data.montoNeto,
        iva: data.iva,
        montoTotal: data.montoTotal,
        estado: data.estado,
        fechaEmision: new Date(data.fechaEmision),
        detalles: detallesTransformados,
      });

      if (success) {
        console.log("Factura actualizada exitosamente"); // Log para depuración
        router.push("/dashboard/facturas");
        onSuccess();
        onClose();
      } else {
        console.error("Error: La actualización de la factura no fue exitosa");
        toast.error("Error al actualizar factura");
      }
    } catch (error) {
      console.error("Error al actualizar factura:", error); // Log detallado del error
      toast.error("Error al actualizar factura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          console.log("Modal cerrado"); // Log para depuración
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Factura</DialogTitle>
          <DialogDescription>
            Actualice los campos de la factura que desea modificar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Evento submit capturado"); // Log para depuración
              form.handleSubmit(
                (data) => {
                  console.log("Validación exitosa, datos:", data); // Log para depuración
                  onSubmit(data);
                },
                (errors) => {
                  console.error("Errores de validación:", errors); // Log de errores de validación
                }
              )(e);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipoDTE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo DTE</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isLoading}
                        value={field.value.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="33">
                            33 - Factura Electrónica
                          </SelectItem>
                          <SelectItem value="34">
                            34 - Factura Exenta
                          </SelectItem>
                          <SelectItem value="56">56 - Nota Débito</SelectItem>
                          <SelectItem value="61">61 - Nota Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isLoading}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMITIDA">Emitida</SelectItem>
                          <SelectItem value="NO_ENVIADA">No Enviada</SelectItem>
                          <SelectItem value="ENVIADA">Enviada</SelectItem>
                          <SelectItem value="ANULADA">Anulada</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rutReceptor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUT Receptor</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        onChange={(e) =>
                          field.onChange(formatRut(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaEmision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Emisión</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="razonSocialReceptor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direccionReceptor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comunaReceptor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comuna</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactoReceptor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacto (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="montoNeto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Neto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          field.onChange(value);
                          recalcularMontos(value);
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IVA</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="montoTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Total</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log("Botón Cancelar presionado"); // Log para depuración
                  onClose();
                }}
                disabled={isLoading}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer"
                onClick={() => console.log("Botón Guardar Cambios presionado")}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
