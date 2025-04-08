"use client";

import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Cliente } from "@/types/cliente";
import { columns } from "./columns";

// Props de la tabla
interface DataTableProps {
  data: Cliente[];
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: number) => void;
}

// Componente de la tabla
export function DataTable({ data, onEditar, onEliminar }: DataTableProps) {
  const [filtro, setFiltro] = useState("");
  const [progress, setProgress] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Simula un proceso de carga
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 10 : 100));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Configuración de la tabla
  const table = useReactTable({
    data,
    columns: columns(onEditar, onEliminar),
    state: {
      globalFilter: filtro,
      pagination,
    },
    onGlobalFilterChange: setFiltro,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
  });

  return (
    <div className="container mx-auto">
      <Input
        placeholder="Filtrar clientes..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-sm mb-4"
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns(onEditar, onEliminar).length}
                className="text-center"
              >
                {progress < 100 && (
                  <Progress value={progress} className="w-[100%]" />
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 cursor-pointer"
          >
            Anterior
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
