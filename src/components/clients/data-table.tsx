"use client";

import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useState, useEffect, useMemo, useCallback } from "react";
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
import useClienteStore from "@/store/client.store";

// Props de la tabla
interface DataTableProps {
  data: Cliente[];
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: number) => void;
}

// Componente de la tabla
export function DataTable({ data, onEditar, onEliminar }: DataTableProps) {
  const { isLoading } = useClienteStore();
  const [filtro, setFiltro] = useState("");
  const [progress, setProgress] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Memoizar las columnas
  const tableColumns = useMemo(
    () => columns(onEditar, onEliminar),
    [onEditar, onEliminar]
  );

  // Memoizar los datos filtrados
  const filteredData = useMemo(() => {
    return data.filter(
      (cliente) =>
        cliente.razonSocial.toLowerCase().includes(filtro.toLowerCase()) ||
        cliente.rut.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [data, filtro]);

  // Memoizar la configuración de la tabla
  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
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

  // Memoizar los handlers de paginación
  const handlePreviousPage = useCallback(() => {
    table.previousPage();
  }, [table]);

  const handleNextPage = useCallback(() => {
    table.nextPage();
  }, [table]);

  // Memoizar el handler del filtro
  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFiltro(e.target.value);
    },
    []
  );

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setProgress(66), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, setProgress]);

  // Renderizar la tabla
  return (
    <div className="container mx-auto">
      <Input
        placeholder="Filtrar clientes..."
        value={filtro}
        onChange={handleFilterChange}
        className="max-w-sm mb-4"
        disabled={isLoading}
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
          {isLoading ? (
            // Mostrar barra de progreso mientras se cargan los datos
            <TableRow>
              <TableCell
                colSpan={columns(onEditar, onEliminar).length}
                className="h-24 text-center"
              >
                <Progress value={progress} className="w-[100%] mx-auto" />
              </TableCell>
            </TableRow>
          ) : data && data.length === 0 && isLoading ? (
            // Mostrar mensaje solo si no hay datos y no estamos cargando
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <span>No hay clientes registrados</span>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 && filtro ? (
            // Mostrar mensaje si no hay resultados para el filtro
            <TableRow>
              <TableCell
                colSpan={columns(onEditar, onEliminar).length}
                className="h-24 text-center"
              >
                <span>No se encontraron resultados para {filtro}</span>
              </TableCell>
            </TableRow>
          ) : (
            // Mostrar las filas de la tabla si hay datos
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
            onClick={handlePreviousPage}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 cursor-pointer"
          >
            Anterior
          </button>
          <button
            onClick={handleNextPage}
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
