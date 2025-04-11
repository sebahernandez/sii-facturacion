"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ImPlus } from "react-icons/im";
import ClienteCreateModal from "@/components/modals/create-client.modal";
import ClienteEditModal from "@/components/modals/edit-client.modal";
import { Cliente } from "@/types/cliente";
import useClienteStore from "@/store/client.store";
import { DataTable } from "@/components/clients/data-table";
import { DeleteAlertDialog } from "@/components/clients/alert-delete";

export default function ClientesPage() {
  const {
    clientes,
    fetchClientes,
    eliminarCliente,
    editarCliente,
    resetClientes,
  } = useClienteStore();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);

  // Memoizar los datos de los clientes
  const memoizedClientes = useMemo(() => clientes ?? [], [clientes]);

  useEffect(() => {
    const controller = new AbortController();
    fetchClientes(controller.signal);
    return () => controller.abort();
  }, [fetchClientes]);

  const handleEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    console.log("Cliente seleccionado:", cliente);
    setEditOpen(true);
  };

  const handleEliminar = (id: number) => setDeleteId(id);

  return (
    <div className="container mx-auto mt-10">
      <DeleteAlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            const clienteAEliminar = memoizedClientes.find(
              (c) => c.id === deleteId
            );
            if (clienteAEliminar) {
              await eliminarCliente(deleteId, clienteAEliminar.razonSocial);
            }
            setDeleteId(null);
          }
        }}
      />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button className="cursor-pointer" onClick={() => setCreateOpen(true)}>
          <ImPlus /> Nuevo Cliente
        </Button>
      </div>

      <DataTable
        data={memoizedClientes}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />

      <ClienteCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={async () => {
          resetClientes();
          await fetchClientes();
        }}
      />

      {clienteSeleccionado && (
        <ClienteEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          cliente={clienteSeleccionado}
          editarCliente={editarCliente}
        />
      )}
    </div>
  );
}
