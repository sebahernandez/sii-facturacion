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
  editarProducto: (producto: Producto) => Promise<boolean>;
}

export default function ProductoEditModal({
  open,
  onClose,
  producto,
  onSuccess,
  editarProducto,
}: Props) {
  const [form, setForm] = useState<Producto>(producto);

  useEffect(() => {
    if (producto) setForm(producto);
  }, [producto]);

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

  const handleChange = (key: keyof Producto, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (editarProducto) {
      const success = await editarProducto(form);
      if (success) {
        onClose();
        onSuccess();
      } else {
        alert("Hubo un error al guardar el producto");
      }
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
          Guardar Cambios
        </Button>
      </DialogContent>
    </Dialog>
  );
}
