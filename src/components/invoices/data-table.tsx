"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiEdit3 } from "react-icons/fi";
import { MdDelete, MdSend } from "react-icons/md";
import { Factura } from "@/types/factura";
import { Progress } from "@/components/ui/progress";
import useInvoiceStore from "@/store/invoices.store";
import { Badge } from "@/components/ui/badge";

// Función para obtener el color del estado
function getEstadoColor(estado: string) {
  switch (estado.toUpperCase()) {
    case "EMITIDA":
      return "bg-green-100 text-green-800";
    case "NO_ENVIADA":
      return "bg-yellow-100 text-yellow-800";
    case "ENVIADA":
      return "bg-blue-100 text-blue-800";
    case "ANULADA":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

interface DataTableProps {
  data: Factura[];
  onEditar: (factura: Factura) => void;
  onEliminar: (id: number) => void;
  onEnviar: (id: number) => void;
}

export function DataTable({ data, onEditar, onEliminar, onEnviar }: DataTableProps) {
  const [filtro, setFiltro] = useState("");
  const { isLoading } = useInvoiceStore();

  const facturasFiltradas = data.filter(
    (factura) =>
      factura.razonSocialReceptor
        .toLowerCase()
        .includes(filtro.toLowerCase()) ||
      factura.id.toString().includes(filtro)
  );

  return (
    <div>
      <Input
        placeholder="Buscar facturas..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-sm mb-4"
        disabled={isLoading}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tipo DTE</TableHead>
            <TableHead>Fecha Emisión</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Monto Neto</TableHead>
            <TableHead>IVA</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <Progress value={100} className="w-[100%] mx-auto" />
              </TableCell>
            </TableRow>
          ) : facturasFiltradas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <span>No se encontraron resultados.</span>
              </TableCell>
            </TableRow>
          ) : (
            facturasFiltradas.map((factura) => (
              <TableRow key={factura.id}>
                <TableCell>{factura.id}</TableCell>
                <TableCell>
                  {factura.tipoDTE === 33
                    ? "Factura Electrónica"
                    : factura.tipoDTE === 34
                    ? "Factura Exenta"
                    : factura.tipoDTE === 56
                    ? "Nota Débito"
                    : factura.tipoDTE === 61
                    ? "Nota Crédito"
                    : `DTE ${factura.tipoDTE}`}
                </TableCell>
                {/* Formatear la fecha */}
                <TableCell>
                  {new Date(factura.fechaEmision).toLocaleDateString()}
                </TableCell>
                <TableCell>{factura.razonSocialReceptor}</TableCell>
                <TableCell>
                  ${factura.montoNeto.toLocaleString("es-CL")}
                </TableCell>
                <TableCell>${factura.iva.toLocaleString("es-CL")}</TableCell>
                <TableCell>
                  ${factura.montoTotal.toLocaleString("es-CL")}
                </TableCell>
                <TableCell>
                  <Badge className={getEstadoColor(factura.estado)}>
                    {factura.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditar(factura)}
                      className="cursor-pointer"
                    >
                      <FiEdit3 className="mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onEliminar(factura.id)}
                      className="cursor-pointer"
                    >
                      <MdDelete className="mr-1" /> Eliminar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onEnviar(factura.id)}
                      className="cursor-pointer"
                    >
                      <MdSend className="mr-1" /> Enviar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
