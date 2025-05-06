"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoiceForm } from "@/hooks/use-invoice-form";
import { toast } from "sonner";
import useClienteStore from "@/store/client.store";
import useProductStore from "@/store/products.store";
import useInvoiceStore from "@/store/invoices.store";
import { useAuthStore } from "@/hooks/authStore";
import { SearchClient } from "@/components/clients/search-client";
import { SearchProduct } from "@/components/products/search-product";
import { Producto } from "@/types/producto";
import { Detalles } from "@/types/detalles";
import { FacturaCreate } from "@/types/factura";
import { FormData } from "@/types/formData";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TablaDetallesEditable } from "@/components/invoice/tabla-detalles-editable";
import {
  handleProductoSelect,
  handleRemoveDetalle,
  handleDetalleChange,
} from "@/utils/invoice-handlers";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

  // Destructure form from useInvoiceForm
  const form = useInvoiceForm();
  const { calcularMontos, register, setValue, watch, reset, handleSubmit } =
    form;

  // Agregar watch para montoNeto y calcular IVA y total automáticamente
  const montoNeto = watch("montoNeto");

  useEffect(() => {
    if (montoNeto) {
      calcularMontos(montoNeto);
    }
  }, [montoNeto, calcularMontos]);

  useEffect(() => {
    const controller = new AbortController();
    fetchClientes(controller.signal);
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchClientes, fetchProducts]);

  const handleClienteSelect = (rutCliente: string) => {
    const clienteSeleccionado = clientes?.find((c) => c.rut === rutCliente);
    if (clienteSeleccionado) {
      setValue("rutReceptor", clienteSeleccionado.rut);
      setValue("razonSocialReceptor", clienteSeleccionado.razonSocial);
      setValue("direccionReceptor", clienteSeleccionado.direccion);
      setValue("comunaReceptor", clienteSeleccionado.comuna);
      setValue("contactoReceptor", clienteSeleccionado.contacto || "");
    }
  };

  // Función adaptadora para usar la función importada
  const handleProductSelect = (producto: Producto) => {
    handleProductoSelect(
      producto,
      detalles,
      productoCantidad,
      setDetalles,
      setValue,
      setProductoCantidad,
      setItemsAccordionOpen
    );
  };

  // Función adaptadora para eliminar detalles
  const handleDetalleRemove = (descripcionProducto: string) => {
    handleRemoveDetalle(descripcionProducto, detalles, setDetalles, setValue);
  };

  // Función adaptadora para cambiar detalles
  const handleDetalleUpdate = (
    descripcion: string,
    field: keyof Detalles,
    value: string | number
  ) => {
    handleDetalleChange(
      descripcion,
      field,
      value,
      detalles,
      setDetalles,
      setValue
    );
  };

  // Funciones para abrir/cerrar acordeones
  const toggleProductsAccordion = () => {
    setProductsAccordionOpen(!productsAccordionOpen);
  };

  // Función para abrir/cerrar acordeón de items
  const toggleItemsAccordion = () => {
    setItemsAccordionOpen(!itemsAccordionOpen);
  };
  // Función para abrir/cerrar acordeón de montos
  const toggleMontosAccordion = () => {
    setMontosAccordionOpen(!montosAccordionOpen);
  };

  const handleFieldChange = (
    field:
      | "tipoDTE"
      | "fechaEmision"
      | "rutReceptor"
      | "razonSocialReceptor"
      | "direccionReceptor"
      | "comunaReceptor"
      | "montoNeto"
      | "iva"
      | "montoTotal"
      | "estado"
      | "observaciones"
      | `detalles.${number}.precioUnit`
      | `detalles.${number}.descuento`
      | `detalles.${number}.montoNeto`,
    value: string | number
  ) => {
    if (field.includes("monto") || field.includes("precioUnit")) {
      value = parseFloat(value.toString());
    }
    form.setValue(field, value);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      console.log("Form submitted with data:", formData);
      const validations = [
        {
          field: formData.rutReceptor,
          message: "Debe ingresar el RUT del receptor",
        },
        {
          field: formData.razonSocialReceptor,
          message: "Debe ingresar la razón social del receptor",
        },
        {
          field: formData.direccionReceptor,
          message: "Debe ingresar la dirección del receptor",
        },
        {
          field: formData.comunaReceptor,
          message: "Debe ingresar la comuna del receptor",
        },
        {
          field: formData.fechaEmision,
          message: "Debe seleccionar una fecha de emisión",
        },
        {
          field: detalles.length > 0 ? "ok" : "", // para que pase el `.trim()`
          message: "Debe agregar al menos un producto",
        },
      ];

      for (const { field, message } of validations) {
        if (!field?.toString().trim()) {
          toast.error(message);
          return;
        }
      }

      setIsLoading(true);

      // Asegurarse de que los montos estén actualizados
      const montoNetoTotal = Math.abs(
        detalles.reduce((acc, detalle) => acc + detalle.montoNeto, 0)
      );
      const ivaTotal = Math.round(montoNetoTotal * 0.19);
      const montoTotal = montoNetoTotal + ivaTotal;

      // Actualizar los montos en el formulario
      setValue("montoNeto", montoNetoTotal);
      setValue("iva", ivaTotal);
      setValue("montoTotal", montoTotal);

      // Obtener los datos de emisor desde la sesión
      const { session } = useAuthStore.getState();

      /* Transformar los detalles
      Asegurarse de que los detalles tengan el tipo correcto
      y convertir los valores a números
      y asegurarse de que los valores sean números
      y no cadenas y que los campos sean correctos */

      const detallesTransformados = detalles.map((detalle) => ({
        cantidad: detalle.cantidad,
        descripcion: detalle.descripcion,
        precioUnit: Number(detalle.precioUnit),
        descuento: Number(detalle.descuento),
        montoNeto: detalle.montoNeto,
      }));

      // Crear el objeto de factura con el tipo correcto para detalles
      const facturaData: FacturaCreate = {
        tipoDTE: formData.tipoDTE,
        rutReceptor: formData.rutReceptor,
        razonSocialReceptor: formData.razonSocialReceptor,
        direccionReceptor: formData.direccionReceptor,
        comunaReceptor: formData.comunaReceptor,
        contactoReceptor: formData.contactoReceptor,
        observaciones: formData.observaciones,
        iva: ivaTotal,
        montoTotal: montoTotal,
        montoNeto: montoNetoTotal,
        detalles: detallesTransformados,
        rutEmisor: "76123456-7",
        razonSocialEmisor: "Mi Empresa SpA",
        user_id: session?.user?.id || "",
        estado: "NO_ENVIADA",
        fechaEmision: formData.fechaEmision
          ? new Date(formData.fechaEmision)
          : new Date(),
      };

      // Crear la factura usando el store
      const { crearFactura } = useInvoiceStore.getState();
      if (!crearFactura) {
        throw new Error("No se pudo acceder a la función crearFactura");
      }
      const resultado = await crearFactura(facturaData);
      console.log("Factura data:", facturaData);

      if (!resultado) {
        throw new Error("Error al crear factura");
      }

      toast.success("Factura creada exitosamente");
      onSuccess();
      reset();
      setDetalles([]);
      setProductoCantidad(1);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Error al crear factura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="min-w-[1000px] max-w-[1240px] flex flex-col max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Factura</DialogTitle>
          <DialogDescription>
            Complete los campos para crear una nueva factura. Incluya la
            información del cliente, detalles y montos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
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
                  <FormField
                    control={form.control}
                    name="tipoDTE"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo DTE</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={true} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fechaEmision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Emisión</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Datos del Receptor */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="font-semibold">Datos del Receptor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rutReceptor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RUT Receptor</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            placeholder="76123456-7"
                            onChange={(e) =>
                              handleFieldChange("rutReceptor", e.target.value)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="razonSocialReceptor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón Social</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactoReceptor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contacto</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="direccionReceptor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="comunaReceptor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comuna</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Rest of the form... */}
            <div className="space-y-4">
              {/* Acordeón para agregar productos */}
              <div className="border rounded-md overflow-hidden shadow-sm">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleProductsAccordion();
                  }}
                  className="w-full flex justify-between items-center py-3 font-medium text-left"
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
                          onSelect={handleProductSelect}
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
                  onClick={(e) => {
                    e.preventDefault();
                    toggleItemsAccordion();
                  }}
                  className="w-full flex justify-between items-center py-3 font-medium text-left"
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
                      handleDetalleChange={handleDetalleUpdate}
                      handleRemoveDetalle={handleDetalleRemove}
                    />
                  </div>
                )}
              </div>

              {/* Acordeón para montos */}
              <div className="border rounded-md overflow-hidden shadow-sm">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMontosAccordion();
                  }}
                  className="w-full flex justify-between items-center py-3 font-medium text-left"
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
                          {...register("montoNeto", { valueAsNumber: true })}
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
                          {...register("iva", { valueAsNumber: true })}
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
                          {...register("montoTotal", {
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
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                disabled={isLoading}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? "Creando..." : "Crear Factura"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
