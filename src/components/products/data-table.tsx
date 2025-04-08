// DataTable.tsx
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
import useProductStore from "@/store/products.store";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Producto } from "@/types/producto";
import { columns } from "./columns";

// Props de la tabla
interface DataTableProps {
  data: Producto[];
  onEditar: (producto: Producto) => void;
  onEliminar: (id: number) => void;
}

// Componente de la tabla
export function DataTable({ data, onEditar, onEliminar }: DataTableProps) {
  const [filtro, setFiltro] = useState("");
  const [progress, setProgress] = useState(0);
  const { isLoading } = useProductStore();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Memoize columns configuration
  const tableColumns = useMemo(
    () => columns(onEditar, onEliminar),
    [onEditar, onEliminar]
  );

  // Memoize filtered data
  const filteredData = useMemo(() => {
    return data.filter(
      (producto) =>
        producto.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [data, filtro]);

  // Memoize pagination handlers
  const handlePreviousPage = () => {
    table.previousPage();
  };

  const handleNextPage = () => {
    table.nextPage();
  };

  // Memoize filter handler
  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFiltro(e.target.value);
    },
    []
  );

  // Simula un proceso de carga
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 10 : 100));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Memoize table configuration
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

  return (
    <div className="container mx-auto">
      <Input
        placeholder="Filtrar productos..."
        value={filtro}
        onChange={handleFilterChange}
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
