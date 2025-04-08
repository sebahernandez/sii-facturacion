"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceInput } from "@/lib/zod";
import { Factura } from "@/types/factura";
import { toast } from "sonner";

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
      folio: factura.folio,
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
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="folio">Folio</Label>
              <Input
                id="folio"
                {...form.register("folio")}
                disabled={isLoading}
              />
            </div>
            {/* Agregar más campos según necesites */}
          </div>
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
      </DialogContent>
    </Dialog>
  );
}
