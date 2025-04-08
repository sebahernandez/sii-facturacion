"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/invoices/data-table";
import { Button } from "@/components/ui/button";
import { ImPlus } from "react-icons/im";
import InvoiceCreateModal from "@/components/modals/create-invoice-modal";
import InvoiceEditModal from "@/components/modals/edit-invoice-modal";
import { Factura } from "@/types/factura";
import useInvoiceStore from "@/store/invoices.store";

export default function InvoicePage() {
  const { facturas, fetchInvoices } = useInvoiceStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<Factura | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleNuevo = () => {
    setFacturaSeleccionada(null);
    setCreateOpen(true);
  };

  const handleEditar = (factura: Factura) => {
    setFacturaSeleccionada(factura);
    setEditOpen(true);
  };

  return (
    <div className="container mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Facturas</h1>
        <Button onClick={handleNuevo} className="cursor-pointer">
          <ImPlus className="mr-2" /> Nueva Factura
        </Button>
      </div>

      {<DataTable data={facturas || []} onEditar={handleEditar} />}

      <InvoiceCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          fetchInvoices();
          setCreateOpen(false);
        }}
      />

      {facturaSeleccionada && (
        <InvoiceEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          factura={facturaSeleccionada}
          onSuccess={() => {
            fetchInvoices();
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
