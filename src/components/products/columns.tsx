// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Producto } from "@/types/producto";
import { Button } from "@/components/ui/button";
import { FiEdit3 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";

export const columns = (
  onEditar: (producto: Producto) => void,
  onEliminar: (id: number) => void
): ColumnDef<Producto>[] => [
  { accessorKey: "codigo", header: "Código" },
  { accessorKey: "descripcion", header: "Descripción" },
  { accessorKey: "cantidad", header: "Cantidad" },

  { accessorKey: "unidadMedida", header: "Unidad" },
  {
    accessorKey: "precioUnitario",
    header: "Precio Unitario",
    cell: ({ row }) =>
      `$${row.original.precioUnitario.toLocaleString("es-CL")}`,
  },
  { accessorKey: "descuento", header: "Descuento" },
  { accessorKey: "montoNeto", header: "Neto" },
  { accessorKey: "iva", header: "IVA" },
  {
    accessorKey: "montoTotal",
    header: "Total",
    cell: ({ row }) => `$${row.original.montoTotal.toLocaleString("es-CL")}`,
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEditar(row.original)}
        >
          <FiEdit3 /> Editar
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onEliminar(row.original.id)}
        >
          <MdDelete /> Eliminar
        </Button>
      </div>
    ),
  },
];
