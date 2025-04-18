"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { FiEdit3 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { Factura } from "@/types/factura";
import { Badge } from "@/components/ui/badge";

// Función para obtener el color del estado
function getEstadoColor(estado: string) {
  switch (estado.toLowerCase()) {
    case "emitida":
      return "bg-green-100 text-green-800";
    case "anulada":
      return "bg-red-100 text-red-800";
    case "rechazada":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Función para crear las columnas de la tabla
export const columns = (
  onEditar: (factura: Factura) => void,
  onEliminar: (id: number) => void
): ColumnDef<Factura>[] => [
  {
    accessorKey: "folio",
    header: "Folio",
    cell: ({ row }) => <span>{row.original.folio}</span>,
  },
  {
    accessorKey: "fechaEmision",
    header: "Fecha Emisión",
    cell: ({ row }) => (
      <span>
        {new Date(row.original.fechaEmision).toLocaleDateString("es-CL")}
      </span>
    ),
  },
  {
    accessorKey: "razonSocialReceptor",
    header: "Cliente",
    cell: ({ row }) => <span>{row.original.razonSocialReceptor}</span>,
  },
  {
    accessorKey: "montoNeto",
    header: "Monto Neto",
    cell: ({ row }) => (
      <span>${row.original.montoNeto.toLocaleString("es-CL")}</span>
    ),
  },
  {
    accessorKey: "iva",
    header: "IVA",
    cell: ({ row }) => <span>${row.original.iva.toLocaleString("es-CL")}</span>,
  },
  {
    accessorKey: "montoTotal",
    header: "Total",
    cell: ({ row }) => (
      <span>${row.original.montoTotal.toLocaleString("es-CL")}</span>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Badge className={getEstadoColor(row.original.estado)}>
        {row.original.estado}
      </Badge>
    ),
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditar(row.original)}
            className="cursor-pointer"
          >
            <FiEdit3 className="mr-1" /> Editar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onEliminar(row.original.id)}
            className="cursor-pointer"
          >
            <MdDelete className="mr-1" /> Eliminar
          </Button>
        </div>
      );
    },
  },
];
