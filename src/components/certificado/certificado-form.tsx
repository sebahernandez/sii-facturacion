"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
}

export default function CertificadoForm() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [certificateInfo, setCertificateInfo] =
    useState<CertificateInfo | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const verificarCertificado = async () => {
    if (!file || !password) {
      toast.error("Debes subir un archivo y escribir la contraseña.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("pfx", file);
    formData.append("password", password);

    try {
      const res = await fetch("/api/verificar-certificado", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Certificado verificado correctamente");
        setToken(data.token);
        setCertificateInfo(data.info);
      } else {
        toast.error(data.error || "Error al verificar el certificado ❌");
      }
    } catch (error) {
      toast.error("Error inesperado al conectar con el servidor.");
      console.error("Error al verificar certificado:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold">Certificado Digital</h2>
        <span className="text-sm text-gray-400">
          Conecte su certificado digital para consultar facturas
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="py-2">
            Subir Certificado Digital (.pfx o .pem)
          </Label>
          <Input type="file" accept=".pfx,.pem" onChange={handleFileChange} />
          {file && (
            <p className="text-xs text-green-600 mt-1">
              Archivo seleccionado: {file.name}
            </p>
          )}
        </div>

        <div>
          <Label className="py-2">Contraseña del Certificado</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese la contraseña del certificado"
          />
        </div>

        <Button
          onClick={verificarCertificado}
          disabled={loading}
          className="w-full mt-6"
        >
          {loading ? "Verificando..." : "Verificar certificado"}
        </Button>

        {certificateInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2">Información del Certificado:</h3>
            <p className="text-sm">
              <strong>Propietario:</strong> {certificateInfo.subject}
            </p>
            <p className="text-sm">
              <strong>Emisor:</strong> {certificateInfo.issuer}
            </p>
            <p className="text-sm">
              <strong>Válido desde:</strong>{" "}
              {new Date(certificateInfo.validFrom).toLocaleDateString()}
            </p>
            <p className="text-sm">
              <strong>Válido hasta:</strong>{" "}
              {new Date(certificateInfo.validTo).toLocaleDateString()}
            </p>
          </div>
        )}

        {token && (
          <div className="mt-4 p-2 bg-gray-100 text-sm rounded">
            <strong>Token obtenido:</strong>
            <p className="overflow-auto text-xs mt-1 p-1 bg-gray-200 rounded">
              {token.substring(0, 50)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
