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

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductoCreateModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    codigo: "",
    descripcion: "",
    cantidad: 1,
    unidadMedida: "UN",
    precioUnitario: 0,
    descuento: 0,
    montoNeto: 0,
    iva: 0,
    montoTotal: 0,
  });

  useEffect(() => {
    const neto = form.precioUnitario - form.descuento;
    const ivaCalc = neto * 0.19;
    const total = neto + ivaCalc;

    setForm((prev) => ({
      ...prev,
      montoNeto: parseFloat(neto.toFixed(2)),
      iva: parseFloat(ivaCalc.toFixed(2)),
      montoTotal: parseFloat(total.toFixed(2)),
    }));
  }, [form.precioUnitario, form.descuento]);

  const handleChange = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/productos", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Producto creado");
      onSuccess();
      onClose();
      setForm({
        codigo: "",
        descripcion: "",
        cantidad: 1,
        unidadMedida: "UN",
        precioUnitario: 0,
        descuento: 0,
        montoNeto: 0,
        iva: 0,
        montoTotal: 0,
      });
    } else {
      toast.error("Error al crear producto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>➕ Nuevo Producto</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label className="py-2">Código</Label>
            <Input
              value={form.codigo}
              onChange={(e) => handleChange("codigo", e.target.value)}
            />
          </div>

          <div>
            <Label className="py-2">Unidad de Medida</Label>
            <Input
              value={form.unidadMedida}
              onChange={(e) => handleChange("unidadMedida", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label className="py-2">Descripción</Label>
            <Input
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
            />
          </div>

          <div>
            <Label className="py-2">Cantidad (Stock)</Label>
            <Input
              type="number"
              value={String(form.cantidad)}
              onChange={(e) =>
                handleChange("cantidad", parseInt(e.target.value))
              }
            />
          </div>

          <div>
            <Label className="py-2">Precio Unitario</Label>
            <Input
              type="number"
              value={String(form.precioUnitario)}
              onChange={(e) =>
                handleChange("precioUnitario", parseFloat(e.target.value))
              }
            />
          </div>

          <div>
            <Label className="py-2">Descuento</Label>
            <Input
              type="number"
              value={String(form.descuento)}
              onChange={(e) =>
                handleChange("descuento", parseFloat(e.target.value))
              }
            />
          </div>

          <div>
            <Label className="py-2">IVA</Label>
            <Input type="number" value={String(form.iva)} disabled />
          </div>

          <div>
            <Label className="py-2">Monto Neto</Label>
            <Input type="number" value={String(form.montoNeto)} disabled />
          </div>

          <div>
            <Label className="py-2">Total</Label>
            <Input type="number" value={String(form.montoTotal)} disabled />
          </div>
        </div>

        <Button className="mt-6 w-full cursor-pointer" onClick={handleSubmit}>
          Guardar Producto
        </Button>
      </DialogContent>
    </Dialog>
  );
}
