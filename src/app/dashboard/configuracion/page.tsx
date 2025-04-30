"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardarConfiguracion, obtenerConfiguracion } from "@/lib/userServices";
import { toast } from "sonner";
import CertificadoForm from "@/components/certificado/certificado-form";
import { Pencil } from "lucide-react";

export default function ConfiguracionEmpresa() {
  const [rut, setRut] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [giro, setGiro] = useState("");
  const [direccion, setDireccion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Estado para almacenar la configuración guardada
  const [configGuardada, setConfigGuardada] = useState({
    rutEmpresa: "",
    razonSocial: "",
    giro: "",
    direccion: "",
  });

  // Cargar datos existentes cuando el componente se monte
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    setIsLoading(true);
    try {
      const config = await obtenerConfiguracion();

      // Guardar la configuración actual
      const datosRecibidos = {
        rutEmpresa: config.rutEmpresa || "",
        razonSocial: config.razonSocial || "",
        giro: config.giro || "",
        direccion: config.direccion || "",
      };

      setConfigGuardada(datosRecibidos);

      // Inicialmente no estamos en modo edición si ya hay datos
      setEditMode(
        !datosRecibidos.rutEmpresa &&
          !datosRecibidos.razonSocial &&
          !datosRecibidos.giro &&
          !datosRecibidos.direccion
      );
    } catch (error) {
      console.error("Error al cargar configuración:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "rut":
        setRut(value);
        break;
      case "razonSocial":
        setRazonSocial(value);
        break;
      case "giro":
        setGiro(value);
        break;
      case "direccion":
        setDireccion(value);
        break;
    }
  };

  const limpiarFormulario = () => {
    setRut("");
    setRazonSocial("");
    setGiro("");
    setDireccion("");
  };

  const handleEditClick = () => {
    // Cargar los datos guardados en el formulario para editar
    setRut(configGuardada.rutEmpresa);
    setRazonSocial(configGuardada.razonSocial);
    setGiro(configGuardada.giro);
    setDireccion(configGuardada.direccion);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    limpiarFormulario();
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!rut || !razonSocial || !giro || !direccion) {
      toast.warning("Por favor complete todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      const datos = {
        rut,
        razonSocial,
        giro,
        direccion,
      };

      await guardarConfiguracion(datos);
      toast.success("Los datos se guardaron exitosamente");

      // Actualizar los datos guardados
      setConfigGuardada({
        rutEmpresa: rut,
        razonSocial,
        giro,
        direccion,
      });

      // Limpiar formulario y salir del modo edición
      limpiarFormulario();
      setEditMode(false);
    } catch (error) {
      console.log("Error:", error);
      toast.error("No se pudo guardar la configuración");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <h1 className="text-2xl text-left font-bold mb-4">Configuración</h1>
      <div className="container mx-auto mt-10 flex flex-col items-center gap-5">
        <Card className="w-full max-w-5xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sección Empresa - Lado Izquierdo */}
              <div className="md:border-r md:pr-8">
                <h2 className="text-lg font-bold mb-4">
                  Configuración de la Empresa
                </h2>

                {!editMode && configGuardada.rutEmpresa ? (
                  // Mostrar datos guardados cuando no estamos en modo edición
                  <div className="space-y-4 bg-muted p-4 rounded-md relative">
                    <h3 className="text-md font-semibold">
                      Datos de la empresa
                    </h3>

                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold">RUT: </span>
                        <span>{configGuardada.rutEmpresa}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Razón Social: </span>
                        <span>{configGuardada.razonSocial}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Giro: </span>
                        <span>{configGuardada.giro}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Dirección: </span>
                        <span>{configGuardada.direccion}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleEditClick}
                      variant="outline"
                      className="mt-4 flex items-center gap-2"
                    >
                      <Pencil size={16} /> Editar configuración
                    </Button>
                  </div>
                ) : (
                  // Mostrar formulario en modo edición
                  <div className="space-y-4">
                    <div>
                      <Label className="py-2">RUT:</Label>
                      <Input
                        value={rut}
                        onChange={(e) =>
                          handleFieldChange("rut", e.target.value)
                        }
                        placeholder="Ingrese el RUT de su empresa"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label className="py-2">Razón Social:</Label>
                      <Input
                        value={razonSocial}
                        onChange={(e) =>
                          handleFieldChange("razonSocial", e.target.value)
                        }
                        placeholder="Razón social de su empresa"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label className="py-2">Giro:</Label>
                      <Input
                        value={giro}
                        onChange={(e) =>
                          handleFieldChange("giro", e.target.value)
                        }
                        placeholder="Giro comercial"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label className="py-2">Dirección:</Label>
                      <Input
                        value={direccion}
                        onChange={(e) =>
                          handleFieldChange("direccion", e.target.value)
                        }
                        placeholder="Dirección comercial"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button
                        onClick={handleSave}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading ? "Guardando..." : "Guardar Configuración"}
                      </Button>

                      {configGuardada.rutEmpresa && (
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección Certificado - Lado Derecho */}
              <div className="md:pl-8">
                <CertificadoForm />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
