"use client";
import { useEffect, useState } from "react";
import { UserInfo } from "./user-info";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import useInvoiceStore from "@/store/invoices.store";
import useClienteStore from "@/store/client.store";
import { Factura } from "@/types/factura";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSignIcon,
  FileTextIcon,
  UserIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface PieChartData {
  name: string;
  value: number;
}

export const DasboardHome = () => {
  const { facturas, fetchInvoices, isLoading } = useInvoiceStore();
  const { clientes, fetchClientes } = useClienteStore();
  const [facturasPorEstado, setFacturasPorEstado] = useState({
    EMITIDA: 0,
    NO_ENVIADA: 0,
    ENVIADA: 0,
    ANULADA: 0,
  });
  const [montosPorEstado, setMontosPorEstado] = useState({
    EMITIDA: 0,
    NO_ENVIADA: 0,
    ENVIADA: 0,
    ANULADA: 0,
  });
  const [ultimasFacturas, setUltimasFacturas] = useState<Factura[]>([]);
  const [totalFacturas, setTotalFacturas] = useState(0);
  const [totalMonto, setTotalMonto] = useState(0);
  const [datosGrafico, setDatosGrafico] = useState<PieChartData[]>([]);

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FF0000"];

  useEffect(() => {
    fetchInvoices();
    fetchClientes();
  }, [fetchInvoices, fetchClientes]);

  useEffect(() => {
    if (facturas) {
      // Contar facturas por estado
      const estadoCount = {
        EMITIDA: 0,
        NO_ENVIADA: 0,
        ENVIADA: 0,
        ANULADA: 0,
      };

      // Sumar montos por estado
      const estadoMonto = {
        EMITIDA: 0,
        NO_ENVIADA: 0,
        ENVIADA: 0,
        ANULADA: 0,
      };

      // Procesar facturas
      facturas.forEach((factura) => {
        if (
          estadoCount[factura.estado as keyof typeof estadoCount] !== undefined
        ) {
          estadoCount[factura.estado as keyof typeof estadoCount] += 1;
          estadoMonto[factura.estado as keyof typeof estadoMonto] +=
            factura.montoTotal;
        }
      });

      // Ordenar facturas por fecha de emisión (las más recientes primero)
      const ordenadas = [...facturas].sort((a, b) => {
        return (
          new Date(b.fechaEmision).getTime() -
          new Date(a.fechaEmision).getTime()
        );
      });

      // Obtener las 5 últimas facturas
      const ultimas = ordenadas.slice(0, 5);

      // Calcular totales
      const total = facturas.length;
      const montoTotal = facturas.reduce(
        (sum, factura) => sum + factura.montoTotal,
        0
      );

      // Preparar datos para gráfico - incluir todos los estados, incluso con valor 0
      const datosParaGrafico = [
        { name: "Emitidas", value: estadoCount.EMITIDA },
        { name: "No Enviadas", value: estadoCount.NO_ENVIADA },
        { name: "Enviadas", value: estadoCount.ENVIADA },
        { name: "Anuladas", value: estadoCount.ANULADA },
      ];

      // Si todos los valores son 0, mostrar un mensaje de estado vacío
      if (datosParaGrafico.every((item) => item.value === 0)) {
        datosParaGrafico[0].value = 1; // Dar un valor nominal al primer elemento para que aparezca el gráfico
      }

      setFacturasPorEstado(estadoCount);
      setMontosPorEstado(estadoMonto);
      setUltimasFacturas(ultimas);
      setTotalFacturas(total);
      setTotalMonto(montoTotal);
      setDatosGrafico(datosParaGrafico);
    }
  }, [facturas]);

  // Calcular tendencias (comparación con valores hipotéticos anteriores como ejemplo)
  const tendenciaFacturas = 15; // Ejemplo: 15% más que el mes anterior
  const tendenciaMonto = 8.5; // Ejemplo: 8.5% más que el mes anterior

  return (
    <div className="container mx-auto mt-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facturas Totales
            </CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileTextIcon className="h-4 w-4 text-blue-500 mr-2" />
                <CardTitle className="text-2xl font-bold">
                  {totalFacturas}
                </CardTitle>
              </div>
              <Badge
                variant={tendenciaFacturas >= 0 ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {tendenciaFacturas >= 0 ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                {Math.abs(tendenciaFacturas)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xs text-muted-foreground">
              Comparado con el periodo anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monto Total Facturado
            </CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSignIcon className="h-4 w-4 text-green-500 mr-2" />
                <CardTitle className="text-2xl font-bold">
                  {formatCurrency(totalMonto)}
                </CardTitle>
              </div>
              <Badge
                variant={tendenciaMonto >= 0 ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {tendenciaMonto >= 0 ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                {Math.abs(tendenciaMonto)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xs text-muted-foreground">
              Comparado con el periodo anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Registrados
            </CardTitle>
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 text-indigo-500 mr-2" />
              <CardTitle className="text-2xl font-bold">
                {clientes?.length || 0}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xs text-muted-foreground">
              Total de clientes en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facturas Pendientes
            </CardTitle>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
              <CardTitle className="text-2xl font-bold">
                {facturasPorEstado.NO_ENVIADA}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xs text-muted-foreground">
              Facturas no enviadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado de facturas */}
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>Estado de Facturas</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosGrafico}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  innerRadius={35}
                  paddingAngle={2}
                  fill="#8884d8"
                  dataKey="value"
                  // Configuración mejorada de las etiquetas
                  label={({ percent }) => {
                    // Solo mostrar etiquetas para sectores significativos (más del 5%)
                    return percent > 0.05
                      ? `${(percent * 100).toFixed(0)}%`
                      : "";
                  }}
                  // Asegurar espacio entre sectores para mejor visualización
                  startAngle={90}
                  endAngle={-270}
                >
                  {datosGrafico.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${name}: ${value}`, ""]}
                  contentStyle={{ fontSize: "12px" }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconSize={10}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <div className="mr-1 h-3 w-3 rounded-full bg-[#0088FE]" />
              <span>Emitidas: {facturasPorEstado.EMITIDA}</span>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-3 w-3 rounded-full bg-[#FF8042]" />
              <span>No Enviadas: {facturasPorEstado.NO_ENVIADA}</span>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-3 w-3 rounded-full bg-[#00C49F]" />
              <span>Enviadas: {facturasPorEstado.ENVIADA}</span>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-3 w-3 rounded-full bg-[#FF0000]" />
              <span>Anuladas: {facturasPorEstado.ANULADA}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Últimas facturas */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Últimas Facturas</CardTitle>
                <CardDescription>Facturas más recientes</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/facturas">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Cargando facturas...
                    </TableCell>
                  </TableRow>
                ) : ultimasFacturas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay facturas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  ultimasFacturas.map((factura) => (
                    <TableRow key={factura.id}>
                      <TableCell>#{factura.id}</TableCell>
                      <TableCell>{factura.razonSocialReceptor}</TableCell>
                      <TableCell>
                        {format(new Date(factura.fechaEmision), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(factura.montoTotal)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            factura.estado === "EMITIDA"
                              ? "default"
                              : factura.estado === "ENVIADA"
                              ? "outline"
                              : factura.estado === "ANULADA"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {factura.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Fila adicional con 2 tarjetas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Montos por estado */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Montos por Estado</CardTitle>
            <CardDescription>
              Distribución financiera por estado de facturas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Emitidas", monto: montosPorEstado.EMITIDA },
                  { name: "No Enviadas", monto: montosPorEstado.NO_ENVIADA },
                  { name: "Enviadas", monto: montosPorEstado.ENVIADA },
                  { name: "Anuladas", monto: montosPorEstado.ANULADA },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <Legend />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar dataKey="monto" name="Monto" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Perfil */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <CardDescription>Información de cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <UserInfo />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
