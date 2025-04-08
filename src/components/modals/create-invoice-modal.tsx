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
import { toast } from "sonner";

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvoiceCreateModal({
  open,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      folio: 0,
      tipoDTE: 33,
      rutReceptor: "",
      razonSocialReceptor: "",
      direccionReceptor: "",
      comunaReceptor: "",
      montoNeto: 0,
      iva: 0,
      montoTotal: 0,
      detalles: [], // Add this as it's required by the schema
      estado: "emitida",
      fechaEmision: new Date().toISOString(),
      razonSocialEmisor: "",
      rutEmisor: "",
    },
  });

  const onSubmit = async (data: InvoiceInput) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/facturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al crear factura");
      }

      toast.success("Factura creada exitosamente");
      onSuccess();
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear factura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Factura</DialogTitle>
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
              {isLoading ? "Creando..." : "Crear Factura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
