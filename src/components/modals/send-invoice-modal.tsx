"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useInvoiceStore from "@/store/invoices.store";

interface SendInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  facturaId: number | null;
}

export default function SendInvoiceModal({ open, onClose, facturaId }: SendInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const { enviarFactura } = useInvoiceStore();

  const handleSend = async () => {
    if (!facturaId) return;
    setLoading(true);
    try {
      const ok = await enviarFactura(facturaId);
      if (ok) {
        toast.success("Factura enviada correctamente");
        onClose();
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
            ¿Está seguro de que desea enviar esta factura al SII?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
