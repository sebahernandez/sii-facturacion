// ProductosPage.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImPlus } from "react-icons/im";
import ProductoCreateModal from "@/components/modals/create-product.modal";
import ProductoEditModal from "@/components/modals/edit-product-modal";
import { Producto } from "@/types/producto";
import { useProductos } from "@/components/products/useProducts";
import { DataTable } from "@/components/products/data-table";
import { DeleteAlertDialog } from "@/components/products/alert-delete";

export default function ProductosPage() {
  const { productos, eliminarProducto, recargarProductos } = useProductos();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  return (
    <div className="container mx-auto mt-10">
      <DeleteAlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await eliminarProducto(deleteId);
          setDeleteId(null);
        }}
      />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <ImPlus /> Nuevo Producto
        </Button>
      </div>

      <DataTable
        data={productos}
        onEditar={(producto) => {
          setProductoSeleccionado(producto);
          setEditOpen(true);
        }}
        onEliminar={(id) => setDeleteId(id)}
      />

      <ProductoCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={recargarProductos}
      />

      {productoSeleccionado && (
        <ProductoEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          producto={productoSeleccionado}
          onSuccess={recargarProductos}
        />
      )}
    </div>
  );
}
