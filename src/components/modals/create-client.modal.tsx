"use client";

import { useState } from "react";
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
  onSuccess: () => Promise<void>;
}

export default function ClienteCreateModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    rut: "",
    razonSocial: "",
    giro: "",
    direccion: "",
    comuna: "",
    ciudad: "",
    contacto: "",
    telefono: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear el cliente");
      }

      await onSuccess();
      onClose();
      toast.success("Cliente creado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear el cliente"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>➕ Nuevo Cliente</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label className="py-2">RUT</Label>
            <Input
              value={form.rut}
              onChange={(e) => handleChange("rut", e.target.value)}
              placeholder="12.345.678-9"
            />
          </div>

          <div>
            <Label className="py-2">Razón Social</Label>
            <Input
              value={form.razonSocial}
              onChange={(e) => handleChange("razonSocial", e.target.value)}
            />
          </div>

          <div>
            <Label className="py-2">Giro</Label>
            <Input
              value={form.giro}
              onChange={(e) => handleChange("giro", e.target.value)}
            />
          </div>

          <div>
            <Label className="py-2">Comuna</Label>
            <Input
              value={form.comuna}
              onChange={(e) => handleChange("comuna", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label className="py-2">Dirección</Label>
            <Input
              value={form.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
            />
          </div>

          <div>
            <Label className="py-2">Ciudad</Label>
            <Input
              value={form.ciudad}
              onChange={(e) => handleChange("ciudad", e.target.value)}
            />
          </div>

          <div>
            <Label className="py-2">Contacto</Label>
            <Input
              value={form.contacto}
              onChange={(e) => handleChange("contacto", e.target.value)}
            />
          </div>

          <div>
            <Label className="py-2">Teléfono</Label>
            <Input
              value={form.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </div>
        </div>

        <Button className="mt-6 w-full cursor-pointer" onClick={handleSubmit}>
          Guardar Cliente
        </Button>
      </DialogContent>
    </Dialog>
  );
}
