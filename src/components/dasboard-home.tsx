"use client";
import { UserInfo } from "./user-info";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const DasboardHome = () => {
  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* 📌 Sección de 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Mi Perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <UserInfo />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Estadísticas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Facturas Emitidas:</strong> 120
            </p>
            <p>
              <strong>Clientes Registrados:</strong> 50
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Últimas Facturas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Factura #12345</strong> - $200.000
            </p>
            <p>
              <strong>Factura #12346</strong> - $150.000
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 📌 Tabla de Datos */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Últimas Transacciones</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 📌 Datos de Ejemplo */}
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>Empresa XYZ</TableCell>
              <TableCell>$100.000</TableCell>
              <TableCell className="text-green-600">Pagado</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell>Juan Pérez</TableCell>
              <TableCell>$250.000</TableCell>
              <TableCell className="text-yellow-600">Pendiente</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>3</TableCell>
              <TableCell>Corporación ABC</TableCell>
              <TableCell>$75.000</TableCell>
              <TableCell className="text-red-600">Vencido</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
