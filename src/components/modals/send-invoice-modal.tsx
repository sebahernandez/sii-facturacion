"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useInvoiceStore from "@/store/invoices.store";

interface SendInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  facturaId: number | null;
}

export default function SendInvoiceModal({ open, onClose, facturaId }: SendInvoiceModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { enviarFactura } = useInvoiceStore();

  const handleSend = async () => {
    if (!facturaId) return;
    setLoading(true);
    try {
      const ok = await enviarFactura(facturaId, password);
      if (ok) {
        toast.success("Factura enviada correctamente");
        onClose();
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar la factura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Enviar Factura al SII</DialogTitle>
          <DialogDescription>
            Ingrese la contraseña del certificado para firmar y enviar la factura.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="password"
          placeholder="Contraseña del certificado"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="mt-2"
        />
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={loading || !password}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
