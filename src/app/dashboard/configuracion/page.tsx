"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardarConfiguracion } from "@/lib/userServices";
import { toast } from "sonner";
import CertificadoForm from "@/components/certificado/certificado-form";

export default function ConfiguracionEmpresa() {
  const [rut, setRut] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [giro, setGiro] = useState("");
  const [direccion, setDireccion] = useState("");

  const handleSave = async () => {
    const datos = {
      rut,
      razonSocial,
      giro,
      direccion,
    };

    try {
      await guardarConfiguracion(datos);
      toast.success("Los datos se guardaron exitosamente");
    } catch (error) {
      console.log("Error:", error);
      toast.error("No se pudo guardar la configuración");
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
                <div className="space-y-4">
                  <div>
                    <Label className="py-2">RUT:</Label>
                    <Input
                      value={rut}
                      onChange={(e) => setRut(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="py-2">Razón Social:</Label>
                    <Input
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="py-2">Giro:</Label>
                    <Input
                      value={giro}
                      onChange={(e) => setGiro(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="py-2">Dirección:</Label>
                    <Input
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSave} className="w-full mt-6">
                    Guardar Configuración
                  </Button>
                </div>
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
