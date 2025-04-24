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
import { Cliente } from "@/types/cliente";
import { toast } from "sonner";
import { formatRut } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  cliente: Cliente;
  editarCliente: (cliente: Cliente) => Promise<boolean>;
}

export default function ClienteEditModal({
  open,
  onClose,
  cliente,
  editarCliente,
}: Props) {
  const [form, setForm] = useState<Cliente>(cliente);

  useEffect(() => {
    setForm(cliente);
  }, [cliente]);

  const handleChange = (field: string, value: string) => {
    if (field === "rut") {
      value = formatRut(value);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const success = await editarCliente(form);
    if (success) {
      toast.success("Cliente editado exitosamente");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label className="py-2">RUT</Label>
            <Input
              value={form.rut}
              onChange={(e) => handleChange("rut", e.target.value)}
              placeholder="76123456-7"
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
              value={form.ciudad || ""}
              onChange={(e) => handleChange("ciudad", e.target.value)}
            />
          </div>

          <div>
            <Label className="py-2">Contacto</Label>
            <Input
              value={form.contacto || ""}
              onChange={(e) => handleChange("contacto", e.target.value)}
            />
          </div>

          <div>
            <Label className="py-2">Teléfono</Label>
            <Input
              value={form.telefono || ""}
              onChange={(e) => handleChange("telefono", e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </div>
        </div>

        <Button className="mt-6 w-full cursor-pointer" onClick={handleSubmit}>
          Guardar Cambios
        </Button>
      </DialogContent>
    </Dialog>
  );
}
