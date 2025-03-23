"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Producto {
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

interface Props {
  open: boolean;
  onClose: () => void;
  producto: Producto;
  onSuccess: () => void;
}

export default function ProductoEditModal({
  open,
  onClose,
  producto,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<Producto>(producto);

  useEffect(() => {
    if (producto) setForm(producto);
  }, [producto]);

  useEffect(() => {
    const neto = form.precioUnitario * form.cantidad - form.descuento;
    const ivaCalc = neto * 0.19;
    const total = neto + ivaCalc;

    setForm((prev) => ({
      ...prev,
      montoNeto: parseFloat(neto.toFixed(2)),
      iva: parseFloat(ivaCalc.toFixed(2)),
      montoTotal: parseFloat(total.toFixed(2)),
    }));
  }, [form.precioUnitario, form.cantidad, form.descuento]);

  const handleChange = (key: keyof Producto, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/productos/${producto.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Producto actualizado");
      onSuccess();
      onClose();
    } else {
      toast.error("Error al actualizar producto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Código</Label>
            <Input
              value={form.codigo}
              onChange={(e) => handleChange("codigo", e.target.value)}
            />
          </div>

          <div>
            <Label>Unidad de Medida</Label>
            <Input
              value={form.unidadMedida}
              onChange={(e) => handleChange("unidadMedida", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label>Descripción</Label>
            <Input
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
            />
          </div>

          <div>
            <Label>Cantidad</Label>
            <Input
              type="number"
              value={form.cantidad}
              onChange={(e) =>
                handleChange("cantidad", parseInt(e.target.value))
              }
            />
          </div>

          <div>
            <Label>Precio Unitario</Label>
            <Input
              type="number"
              value={form.precioUnitario}
              onChange={(e) =>
                handleChange("precioUnitario", parseFloat(e.target.value))
              }
            />
          </div>

          <div>
            <Label>Descuento</Label>
            <Input
              type="number"
              value={form.descuento}
              onChange={(e) =>
                handleChange("descuento", parseFloat(e.target.value))
              }
            />
          </div>

          <div>
            <Label>IVA</Label>
            <Input type="number" value={form.iva} disabled />
          </div>

          <div>
            <Label>Monto Neto</Label>
            <Input type="number" value={form.montoNeto} disabled />
          </div>

          <div>
            <Label>Total</Label>
            <Input type="number" value={form.montoTotal} disabled />
          </div>
        </div>

        <Button className="mt-6 w-full cursor-pointer" onClick={handleSubmit}>
          Guardar Cambios
        </Button>
      </DialogContent>
    </Dialog>
  );
}
