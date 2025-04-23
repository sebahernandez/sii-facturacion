import React from "react";
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
import { Trash } from "lucide-react";
import { Detalles } from "@/types/detalles";

export const TablaDetallesEditable = ({
  detalles,
  isLoading,
  handleDetalleChange,
  handleRemoveDetalle,
}: {
  detalles: Detalles[];
  isLoading: boolean;
  handleDetalleChange: (
    descripcion: string,
    field: keyof Detalles,
    value: string | number
  ) => void;
  handleRemoveDetalle: (descripcion: string) => void;
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="min-w-[200px]">Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio Unit.</TableHead>
            <TableHead>Descuento</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {detalles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                No hay productos agregados
              </TableCell>
            </TableRow>
          ) : (
            detalles.map((detalle) => (
              <TableRow key={detalle.descripcion}>
                <TableCell className="min-w-[200px]">
                  {detalle.descripcion}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={detalle.cantidad}
                    min={1}
                    onChange={(e) =>
                      handleDetalleChange(
                        detalle.descripcion,
                        "cantidad",
                        Number(e.target.value)
                      )
                    }
                    className="w-20 h-8"
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={detalle.precioUnit}
                    onChange={(e) =>
                      handleDetalleChange(
                        detalle.descripcion,
                        "precioUnit",
                        e.target.value
                      )
                    }
                    className="w-28 h-8"
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={detalle.descuento}
                    onChange={(e) =>
                      handleDetalleChange(
                        detalle.descripcion,
                        "descuento",
                        e.target.value
                      )
                    }
                    className="w-28 h-8"
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell>
                  ${detalle.montoNeto.toLocaleString("es-CL")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveDetalle(detalle.descripcion)}
                    disabled={isLoading}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
