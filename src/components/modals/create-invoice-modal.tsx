"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceInput } from "@/lib/zod";
import { toast } from "sonner";
import useClienteStore from "@/store/client.store";
import useProductStore from "@/store/products.store";
import { SearchClient } from "@/components/clients/search-client";
import { SearchProduct } from "@/components/products/search-product";
import { Producto } from "@/types/producto";
import { Detalles } from "@/types/detalles";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TablaDetallesEditable } from "@/components/invoice/tabla-detalles-editable";

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
export default function InvoiceCreateModal({
  open,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { clientes, fetchClientes } = useClienteStore();
  const { productos, fetchProducts } = useProductStore();
  const [detalles, setDetalles] = useState<Detalles[]>([]);
  const [productoCantidad, setProductoCantidad] = useState<number>(1);
  const [productsAccordionOpen, setProductsAccordionOpen] =
    useState<boolean>(false);
  const [itemsAccordionOpen, setItemsAccordionOpen] = useState<boolean>(true);
  const [montosAccordionOpen, setMontosAccordionOpen] = useState<boolean>(true);

  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      tipoDTE: 33,
      rutReceptor: "",
      razonSocialReceptor: "",
      direccionReceptor: "",
      comunaReceptor: "",
      fechaEmision: new Date().toISOString().split("T")[0],
      montoNeto: 0,
      iva: 0,
      montoTotal: 0,
      estado: "emitida",
      detalles: [],
    },
  });

  // Agregar watch para montoNeto y calcular IVA y total automáticamente
  const montoNeto = form.watch("montoNeto");

  const calcularMontos = useCallback(
    (neto: number) => {
      const iva = Math.round(neto * 0.19);
      const total = neto + iva;
      form.setValue("iva", iva);
      form.setValue("montoTotal", total);
    },
    [form]
  );

  useEffect(() => {
    if (montoNeto) {
      calcularMontos(montoNeto);
    }
    const controller = new AbortController();
    fetchClientes(controller.signal);
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchClientes, fetchProducts, calcularMontos, montoNeto]);

  const handleClienteSelect = (rutCliente: string) => {
    const clienteSeleccionado = clientes?.find((c) => c.rut === rutCliente);
    if (clienteSeleccionado) {
      form.setValue("rutReceptor", clienteSeleccionado.rut);
      form.setValue("razonSocialReceptor", clienteSeleccionado.razonSocial);
      form.setValue("direccionReceptor", clienteSeleccionado.direccion);
      form.setValue("comunaReceptor", clienteSeleccionado.comuna);
      form.setValue("contactoReceptor", clienteSeleccionado.contacto || "");
    }
  };

  const handleProductoSelect = (producto: Producto) => {
    const detalleExistente = detalles.find(
      (detalle) => detalle.descripcion === producto.descripcion
    );

    let nuevosDetalles;
    if (detalleExistente) {
      nuevosDetalles = detalles.map((detalle) =>
        detalle.descripcion === producto.descripcion
          ? {
              ...detalle,
              cantidad: detalle.cantidad + productoCantidad,
              montoNeto:
                (detalle.cantidad + productoCantidad) *
                  Number(detalle.precioUnit) -
                Number(detalle.descuento),
            }
          : detalle
      );
    } else {
      const montoNetoProducto =
        productoCantidad * producto.precioUnitario - (producto.descuento || 0);
      nuevosDetalles = [
        ...detalles,
        {
          cantidad: productoCantidad,
          descripcion: producto.descripcion,
          precioUnit: String(producto.precioUnitario),
          descuento: String(producto.descuento || 0),
          montoNeto: montoNetoProducto,
        },
      ];
    }

    setDetalles(nuevosDetalles);

    // Calcular el nuevo monto neto total con los detalles actualizados
    const montoNetoNuevo = nuevosDetalles.reduce(
      (acc, detalle) => acc + detalle.montoNeto,
      0
    );
    form.setValue("montoNeto", montoNetoNuevo);
    setProductoCantidad(1);

    // Abrir la lista de items después de añadir un producto
    setItemsAccordionOpen(true);
  };

  const handleRemoveDetalle = (descripcionProducto: string) => {
    const nuevosDetalles = detalles.filter(
      (detalle) => detalle.descripcion !== descripcionProducto
    );

    setDetalles(nuevosDetalles);

    // Recalcular el monto neto total con los detalles actualizados
    const montoNetoNuevo = nuevosDetalles.reduce(
      (acc, detalle) => acc + detalle.montoNeto,
      0
    );
    form.setValue("montoNeto", montoNetoNuevo);
  };

  // Agregar nueva función para manejar cambios en los detalles
  const handleDetalleChange = (
    descripcion: string,
    field: keyof Detalles,
    value: string | number
  ) => {
    const nuevosDetalles = detalles.map((detalle) => {
      if (detalle.descripcion === descripcion) {
        const nuevoDetalle = { ...detalle };

        if (field === "cantidad") {
          nuevoDetalle.cantidad = Number(value);
        } else if (field === "precioUnit" || field === "descuento") {
          nuevoDetalle[field] = String(value);
        }

        // Recalcular el monto neto del item
        nuevoDetalle.montoNeto =
          nuevoDetalle.cantidad * Number(nuevoDetalle.precioUnit) -
          Number(nuevoDetalle.descuento);
        return nuevoDetalle;
      }
      return detalle;
    });

    setDetalles(nuevosDetalles);

    // Actualizar el monto neto total
    const montoNetoNuevo = nuevosDetalles.reduce(
      (acc, detalle) => acc + detalle.montoNeto,
      0
    );
    form.setValue("montoNeto", montoNetoNuevo);
  };

  const toggleProductsAccordion = () => {
    setProductsAccordionOpen(!productsAccordionOpen);
  };

  const toggleItemsAccordion = () => {
    setItemsAccordionOpen(!itemsAccordionOpen);
  };

  const toggleMontosAccordion = () => {
    setMontosAccordionOpen(!montosAccordionOpen);
  };

  const onSubmit = async (data: InvoiceInput) => {
    try {
      setIsLoading(true);

      // Asegurarse de que los montos estén actualizados
      const montoNetoTotal = detalles.reduce(
        (acc, detalle) => acc + detalle.montoNeto,
        0
      );
      const ivaTotal = Math.round(montoNetoTotal * 0.19);
      const montoTotal = montoNetoTotal + ivaTotal;

      const facturaData = {
        ...data,
        montoNeto: montoNetoTotal,
        iva: ivaTotal,
        montoTotal: montoTotal,
        detalles: detalles,
      };

      const response = await fetch("/api/facturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(facturaData),
      });

      if (!response.ok) {
        throw new Error("Error al crear factura");
      }

      toast.success("Factura creada exitosamente");
      onSuccess();
      form.reset();
      setDetalles([]);
      setProductoCantidad(1);
    } catch (error) {
      console.error(error);
      toast.error("Error al crear factura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[1000px] max-w-[1240px] flex flex-col max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Factura</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col gap-6"
        >
          {/* Sección de datos del cliente y factura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buscador de Cliente */}
            <div className="space-y-11">
              <h3 className="font-semibold">Buscar Cliente</h3>
              <SearchClient
                clientes={clientes}
                onSelect={handleClienteSelect}
              />
            </div>

            {/* Detalles de la Factura */}
            <div className="space-y-4">
              <h3 className="font-semibold">Detalles de la Factura</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoDTE" className="py-2">
                    Tipo DTE
                  </Label>
                  <Input
                    id="tipoDTE"
                    {...form.register("tipoDTE", { valueAsNumber: true })}
                    disabled={true}
                    defaultValue="33"
                  />
                </div>
                <div>
                  <Label htmlFor="fechaEmision" className="py-2">
                    Fecha Emisión
                  </Label>
                  <Input
                    id="fechaEmision"
                    type="date"
                    {...form.register("fechaEmision")}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Datos del Receptor */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-semibold">Datos del Receptor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rutReceptor" className="py-2">
                    RUT Receptor
                  </Label>
                  <Input
                    id="rutReceptor"
                    {...form.register("rutReceptor")}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="razonSocialReceptor" className="py-2">
                    Razón Social
                  </Label>
                  <Input
                    id="razonSocialReceptor"
                    {...form.register("razonSocialReceptor")}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="contactoReceptor" className="py-2">
                    Email de Contacto
                  </Label>
                  <Input
                    id="contactoReceptor"
                    {...form.register("contactoReceptor")}
                    disabled={isLoading}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="direccionReceptor" className="py-2">
                    Dirección
                  </Label>
                  <Input
                    id="direccionReceptor"
                    {...form.register("direccionReceptor")}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="comunaReceptor" className="py-2">
                    Comuna
                  </Label>
                  <Input
                    id="comunaReceptor"
                    {...form.register("comunaReceptor")}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Secciones colapsables */}
          <div className="space-y-4">
            {/* Acordeón para agregar productos */}
            <div className="border rounded-md overflow-hidden shadow-sm">
              <Button
                type="button"
                variant="ghost"
                className="w-full flex justify-between items-center py-3 font-medium text-left"
                onClick={toggleProductsAccordion}
              >
                <h3 className="font-semibold">Agregar Productos</h3>
                {productsAccordionOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
              {productsAccordionOpen && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="producto" className="py-2">
                        Producto
                      </Label>
                      <SearchProduct
                        productos={productos}
                        onSelect={handleProductoSelect}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cantidad" className="py-2">
                        Cantidad
                      </Label>
                      <Input
                        id="cantidad"
                        type="number"
                        value={productoCantidad}
                        onChange={(e) =>
                          setProductoCantidad(Number(e.target.value))
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Acordeón para la lista de items */}
            <div className="border rounded-md overflow-hidden shadow-sm">
              <Button
                type="button"
                variant="ghost"
                className="w-full flex justify-between items-center py-3 font-medium text-left"
                onClick={toggleItemsAccordion}
              >
                <h3 className="font-semibold">Lista de Items</h3>
                {itemsAccordionOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
              {itemsAccordionOpen && (
                <div className="p-4 pt-0">
                  <TablaDetallesEditable
                    detalles={detalles}
                    isLoading={isLoading}
                    handleDetalleChange={handleDetalleChange}
                    handleRemoveDetalle={handleRemoveDetalle}
                  />
                </div>
              )}
            </div>

            {/* Acordeón para montos */}
            <div className="border rounded-md overflow-hidden shadow-sm">
              <Button
                type="button"
                variant="ghost"
                className="w-full flex justify-between items-center py-3 font-medium text-left"
                onClick={toggleMontosAccordion}
              >
                <h3 className="font-semibold">Montos y Resumen</h3>
                {montosAccordionOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
              {montosAccordionOpen && (
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="montoNeto" className="py-2">
                        Monto Neto
                      </Label>
                      <Input
                        id="montoNeto"
                        type="number"
                        {...form.register("montoNeto", { valueAsNumber: true })}
                        disabled={true}
                      />
                    </div>
                    <div>
                      <Label htmlFor="iva" className="py-2">
                        IVA (19%)
                      </Label>
                      <Input
                        id="iva"
                        type="number"
                        {...form.register("iva", { valueAsNumber: true })}
                        disabled={true}
                      />
                    </div>
                    <div>
                      <Label htmlFor="montoTotal" className="py-2">
                        Total
                      </Label>
                      <Input
                        id="montoTotal"
                        type="number"
                        {...form.register("montoTotal", {
                          valueAsNumber: true,
                        })}
                        disabled={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Factura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
