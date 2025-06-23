"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/invoices/data-table";
import { Button } from "@/components/ui/button";
import { ImPlus } from "react-icons/im";
import InvoiceCreateModal from "@/components/modals/create-invoice-modal";
import InvoiceEditModal from "@/components/modals/edit-invoice-modal";
import SendInvoiceModal from "@/components/modals/send-invoice-modal";
import { Factura } from "@/types/factura";
import useInvoiceStore from "@/store/invoices.store";
import { AlertDelete } from "./alert-delete";
import { useRouter, useSearchParams } from "next/navigation";

export default function InvoicePage() {
  const { facturas, fetchInvoices, eliminarFactura } = useInvoiceStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<Factura | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [idFacturaEliminar, setIdFacturaEliminar] = useState<number | null>(
    null
  );
  const [sendOpen, setSendOpen] = useState(false);
  const [idFacturaEnviar, setIdFacturaEnviar] = useState<number | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const facturaId = searchParams.get("id");

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    if (facturaId && facturas) {
      const factura = facturas.find((f) => f.id === parseInt(facturaId));
      if (factura) {
        setFacturaSeleccionada(factura);
        setEditOpen(true);
      }
    }
  }, [facturaId, facturas]);

  const handleNuevo = () => {
    setFacturaSeleccionada(null);
    setCreateOpen(true);
  };

  const handleEditar = (factura: Factura) => {
    router.push(`/dashboard/facturas?id=${factura.id}`);
  };

  const handleCloseEditModal = () => {
    router.push("/dashboard/facturas");
    setEditOpen(false);
    setFacturaSeleccionada(null);
  };

  const handleEliminar = (id: number) => {
    setIdFacturaEliminar(id);
    setDeleteAlertOpen(true);
  };

  const handleEnviar = (id: number) => {
    setIdFacturaEnviar(id);
    setSendOpen(true);
  };

  const confirmarEliminar = async () => {
    if (idFacturaEliminar) {
      try {
        const resultado = await eliminarFactura(idFacturaEliminar);
        if (resultado) {
          setDeleteAlertOpen(false);
          setIdFacturaEliminar(null);
          await fetchInvoices();
        }
      } catch (error) {
        console.error("Error al eliminar factura:", error);
      }
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Facturas</h1>
        <Button onClick={handleNuevo} className="cursor-pointer">
          <ImPlus className="mr-2" /> Nueva Factura
        </Button>
      </div>

      <DataTable
        data={facturas || []}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onEnviar={handleEnviar}
      />

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
          onClose={handleCloseEditModal}
          factura={facturaSeleccionada}
          onSuccess={() => {
            fetchInvoices();
            handleCloseEditModal();
          }}
        />
      )}

      <AlertDelete
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={confirmarEliminar}
        onCancel={() => {
          setDeleteAlertOpen(false);
          setIdFacturaEliminar(null);
        }}
        title="¿Eliminar factura?"
        description={`¿Estás seguro de que quieres eliminar la factura #${idFacturaEliminar}? Esta acción no se puede deshacer.`}
      />

      <SendInvoiceModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        facturaId={idFacturaEnviar}
      />
    </div>
  );
}
