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
import { Factura } from "@/types/factura";

interface DataTableProps {
  data: Factura[];
  onEditar: (factura: Factura) => void;
}

export function DataTable({ data, onEditar }: DataTableProps) {
  const [filtro, setFiltro] = useState("");

  const facturasFiltradas = data.filter(
    (factura) =>
      factura.razonSocialReceptor
        .toLowerCase()
        .includes(filtro.toLowerCase()) ||
      factura.folio.toString().includes(filtro)
  );

  return (
    <div>
      <Input
        placeholder="Buscar facturas..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-sm mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Folio</TableHead>
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
          {facturasFiltradas.map((factura) => (
            <TableRow key={factura.id}>
              <TableCell>{factura.folio}</TableCell>
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
              <TableCell>{factura.estado}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditar(factura)}
                  className="cursor-pointer"
                >
                  <FiEdit3 className="mr-2" /> Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
