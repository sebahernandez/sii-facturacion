"use client";

import { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceInput } from "@/lib/zod";
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
  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      tipoDTE: factura.tipoDTE,
      rutReceptor: factura.rutReceptor,
      razonSocialReceptor: factura.razonSocialReceptor,
      direccionReceptor: factura.direccionReceptor,
      comunaReceptor: factura.comunaReceptor,
      montoNeto: factura.montoNeto,
      iva: factura.iva,
      montoTotal: factura.montoTotal,
    },
  });

  const handleFieldChange = (field: keyof InvoiceInput, value: string) => {
    if (field === "rutReceptor") {
      value = formatRut(value);
    }
    form.setValue(field, value);
  };

  const onSubmit = async (data: InvoiceInput) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/facturas/${factura.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar factura");
      }

      toast.success("Factura actualizada exitosamente");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar factura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Factura</DialogTitle>
          <DialogDescription>
            Actualice los campos de la factura que desea modificar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange("rutReceptor", e.target.value)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ... resto de los campos ... */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
