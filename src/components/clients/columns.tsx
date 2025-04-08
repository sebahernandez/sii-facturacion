import { ColumnDef } from "@tanstack/react-table";
import { Cliente } from "@/types/cliente";
import { Button } from "@/components/ui/button";
import { FiEdit3 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";

export const columns = (
  onEditar: (cliente: Cliente) => void,
  onEliminar: (id: number) => void
): ColumnDef<Cliente>[] => [
  { accessorKey: "rut", header: "RUT" },
  { accessorKey: "razonSocial", header: "Razón Social" },
  { accessorKey: "giro", header: "Giro" },
  { accessorKey: "direccion", header: "Dirección" },
  { accessorKey: "comuna", header: "Comuna" },
  { accessorKey: "ciudad", header: "Ciudad" },
  { accessorKey: "contacto", header: "Contacto" },
  { accessorKey: "telefono", header: "Teléfono" },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          className="cursor-pointer"
          size="sm"
          variant="outline"
          onClick={() => onEditar(row.original)}
        >
          <FiEdit3 /> Editar
        </Button>
        <Button
          className="cursor-pointer"
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
