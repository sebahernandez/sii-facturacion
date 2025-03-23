"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerToken, guardarConfiguracion } from "@/lib/api-sii";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function ConfiguracionCertificado() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<string[]>([]);

  //user save state
  const [rut, setRut] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [giro, setGiro] = useState("");
  const [direccion, setDireccion] = useState("");

  const documentosDisponibles = [
    "Factura Electrónica (33)",
    "Boleta Electrónica (39)",
    "Nota de Crédito (61)",
    "Nota de Débito (56)",
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSave = async () => {
    const datos = {
      rut,
      razonSocial,
      giro: razonSocial,
      direccion: direccion,
      documentos: documentos,
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
    <div className="container mx-auto mt-10 flex flex-col md:flex-row md:justify-center items-start gap-5 ">
      <Card className="flex-none">
        <CardContent className="p-4">
          <div className="mb-5">
            <h2 className="text-lg font-bold">Certificado Digital</h2>
            <span>Conecte su certificado digital para consultar facturas</span>
          </div>
          <Label className="py-2">
            Subir Certificado Digital (.pfx o .pem)
          </Label>
          <Input
            type="file"
            accept=".pfx,.pem"
            onChange={handleFileChange}
            className="mb-4"
          />

          <Label className="py-2">Contraseña del Certificado</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />

          <Button
            onClick={() => obtenerToken(file!, password, setToken, setLoading)}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Conectando..." : "Conectar"}
          </Button>

          {token && (
            <div className="mt-4 p-2 bg-gray-100 text-sm">
              <strong>Token obtenido:</strong> {token}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full md:w-1/2 flex-none">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-4">
            Configuración de la Empresa
          </h2>
          <Label className="py-2">RUT:</Label>
          <Input
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            className="mb-4"
          />

          <Label className="py-2">Razón Social:</Label>
          <Input
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            className="mb-4"
          />

          <Label className="py-2">Giro:</Label>
          <Input
            value={giro}
            onChange={(e) => setGiro(e.target.value)}
            className="mb-4"
          />

          <Label className="py-2">Dirección:</Label>
          <Input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="mb-4"
          />

          <Label className="block mb-2">Documentos a Emitir</Label>
          {documentosDisponibles.map((doc) => (
            <div key={doc} className="flex items-center mb-2">
              <Checkbox
                checked={documentos.includes(doc)}
                onCheckedChange={(checked) => {
                  setDocumentos((prev) =>
                    checked ? [...prev, doc] : prev.filter((d) => d !== doc)
                  );
                }}
              />
              <label htmlFor={doc} className="ml-2">
                {doc}
              </label>
            </div>
          ))}

          <Button onClick={handleSave} className="w-full mt-4">
            Guardar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
