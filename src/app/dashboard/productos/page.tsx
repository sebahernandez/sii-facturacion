"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { ImPlus } from "react-icons/im";
import { MdDelete } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import ProductoCreateModal from "@/components/modals/create-product.modal";
import ProductoEditModal from "@/components/modals/edit-product-modal";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProductos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/productos");
      const data = await res.json();
      setProductos(data);
    } catch (e) {
      console.log(e);
      return toast.error("Error al obtener productos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleNuevo = () => {
    setProductoSeleccionado(null);
    setCreateOpen(true);
  };

  const handleEditar = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setEditOpen(true);
  };

  const handleEliminar = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmarEliminacion = async () => {
    if (!deleteId) return;

    const res = await fetch(`/api/productos/${deleteId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Producto eliminado");
      fetchProductos();
    } else {
      toast.error("Error al eliminar producto");
    }
    setShowDeleteDialog(false);
    setDeleteId(null);
  };

  return (
    <div className="container mx-auto mt-10">
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el producto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarEliminacion}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={handleNuevo} className="cursor-pointer">
          <ImPlus /> Nuevo Producto
        </Button>
      </div>

      {/* Tabla de productos */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Precio Unitario</TableHead>
            <TableHead>Descuento</TableHead>
            <TableHead>Monto Neto</TableHead>
            <TableHead>IVA</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                <Progress value={100} className="w-[60%]" />
              </TableCell>
            </TableRow>
          ) : (
            productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell>{producto.codigo}</TableCell>
                <TableCell>{producto.descripcion}</TableCell>
                <TableCell>{producto.cantidad}</TableCell>
                <TableCell>{producto.unidadMedida}</TableCell>
                <TableCell>
                  ${producto.precioUnitario.toLocaleString()}
                </TableCell>
                <TableCell>${producto.descuento.toLocaleString()}</TableCell>
                <TableCell>${producto.montoNeto.toLocaleString()}</TableCell>
                <TableCell>${producto.iva.toLocaleString()}</TableCell>
                <TableCell>
                  $
                  {producto.montoTotal.toLocaleString("es-CL", {
                    minimumFractionDigits: 0,
                  })}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditar(producto)}
                    className="cursor-pointer"
                  >
                    <FiEdit3 /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleEliminar(producto.id)}
                    className="cursor-pointer"
                  >
                    <MdDelete /> Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal de crear/editar producto */}
      <ProductoCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchProductos}
      />

      {productoSeleccionado && (
        <ProductoEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          producto={productoSeleccionado}
          onSuccess={fetchProductos}
        />
      )}
    </div>
  );
}
