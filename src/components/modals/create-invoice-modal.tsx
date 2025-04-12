"use client";

import { useState, useEffect, useCallback } from "react";
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

import useClienteStore from "@/store/client.store";
import { SearchClient } from "@/components/clients/search-client";

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
  const { clientes, fetchClientes } = useClienteStore();
  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      tipoDTE: 33,
      rutReceptor: "",
      razonSocialReceptor: "",
      direccionReceptor: "",
      comunaReceptor: "",
      fechaEmision: new Date().toISOString().split("T")[0],
      montoNeto: 0,
      iva: 0,
      montoTotal: 0,
      estado: "emitida",
      detalles: [],
    },
  });

  // Agregar watch para montoNeto y calcular IVA y total automáticamente
  const montoNeto = form.watch("montoNeto");

  const calcularMontos = useCallback(
    (neto: number) => {
      const iva = Math.round(neto * 0.19);
      const total = neto + iva;
      form.setValue("iva", iva);
      form.setValue("montoTotal", total);
    },
    [form]
  );

  useEffect(() => {
    if (montoNeto) {
      calcularMontos(montoNeto);
    }
  }, [calcularMontos, montoNeto]);

  useEffect(() => {
    const controller = new AbortController();
    fetchClientes(controller.signal);
    return () => controller.abort();
  }, [fetchClientes]);

  const handleClienteSelect = (rutCliente: string) => {
    const clienteSeleccionado = clientes?.find((c) => c.rut === rutCliente);
    if (clienteSeleccionado) {
      form.setValue("rutReceptor", clienteSeleccionado.rut);
      form.setValue("razonSocialReceptor", clienteSeleccionado.razonSocial);
      form.setValue("direccionReceptor", clienteSeleccionado.direccion);
      form.setValue("comunaReceptor", clienteSeleccionado.comuna);
      form.setValue("contactoReceptor", clienteSeleccionado.contacto || "");
    }
  };

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
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Factura</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Buscador de Cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold">Buscar Cliente</h3>
            <SearchClient clientes={clientes} onSelect={handleClienteSelect} />
          </div>

          {/* Datos del Receptor */}
          <div className="space-y-4">
            <h3 className="font-semibold">Datos del Receptor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rutReceptor">RUT Receptor</Label>
                <Input
                  id="rutReceptor"
                  {...form.register("rutReceptor")}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="razonSocialReceptor">Razón Social</Label>
                <Input
                  id="razonSocialReceptor"
                  {...form.register("razonSocialReceptor")}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="direccionReceptor">Dirección</Label>
                <Input
                  id="direccionReceptor"
                  {...form.register("direccionReceptor")}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="comunaReceptor">Comuna</Label>
                <Input
                  id="comunaReceptor"
                  {...form.register("comunaReceptor")}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="contactoReceptor">Email de Contacto</Label>
                <Input
                  id="contactoReceptor"
                  {...form.register("contactoReceptor")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Detalles de la Factura */}
          <div className="space-y-4">
            <h3 className="font-semibold">Detalles de la Factura</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipoDTE">Tipo DTE</Label>
                <Input
                  id="tipoDTE"
                  {...form.register("tipoDTE", { valueAsNumber: true })}
                  disabled={true}
                  defaultValue="33"
                />
              </div>
              <div>
                <Label htmlFor="fechaEmision">Fecha Emisión</Label>
                <Input
                  id="fechaEmision"
                  type="date"
                  {...form.register("fechaEmision")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Montos */}
          <div className="space-y-4">
            <h3 className="font-semibold">Montos</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="montoNeto">Monto Neto</Label>
                <Input
                  id="montoNeto"
                  type="number"
                  {...form.register("montoNeto", { valueAsNumber: true })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="iva">IVA (19%)</Label>
                <Input
                  id="iva"
                  type="number"
                  {...form.register("iva", { valueAsNumber: true })}
                  disabled={true}
                />
              </div>
              <div>
                <Label htmlFor="montoTotal">Total</Label>
                <Input
                  id="montoTotal"
                  type="number"
                  {...form.register("montoTotal", { valueAsNumber: true })}
                  disabled={true}
                />
              </div>
            </div>
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
