"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerToken } from "@/lib/userServices";

export default function CertificadoForm() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
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
        </div>

        <div>
          <Label className="py-2">Contraseña del Certificado</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          onClick={() => obtenerToken(file!, password, setToken, setLoading)}
          disabled={loading}
          className="w-full mt-6"
        >
          {loading ? "Conectando..." : "Conectar"}
        </Button>

        {token && (
          <div className="mt-4 p-2 bg-gray-100 text-sm rounded">
            <strong>Token obtenido:</strong> {token}
          </div>
        )}
      </div>
    </div>
  );
}
