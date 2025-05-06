"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Trash2, Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
}

export default function CertificadoForm() {
  // Corregimos para indicar que no usamos session explícitamente
  const { status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCertInfo, setLoadingCertInfo] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [certificateInfo, setCertificateInfo] =
    useState<CertificateInfo | null>(null);

  // Cargar certificado guardado al iniciar
  useEffect(() => {
    // La función dentro de useEffect sí es asíncrona
    const fetchStoredCertificate = async () => {
      // No cargar certificado si el usuario no está autenticado
      if (status === "unauthenticated") {
        setLoadingCertInfo(false);
        return;
      }

      // Esperar a que termine de cargar la sesión
      if (status === "loading") {
        return;
      }

      try {
        const res = await fetch("/api/certificado");
        const data = await res.json();

        if (res.ok && data.hasCertificate) {
          setHasCertificate(true);
          setCertificateInfo(data.certificateInfo);
        } else {
          setHasCertificate(false);
          setCertificateInfo(null);
        }
      } catch (error) {
        console.error("Error al cargar el certificado guardado:", error);
      } finally {
        setLoadingCertInfo(false);
      }
    };

    fetchStoredCertificate();
  }, [status]);

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
        setHasCertificate(true);
        setCertificateInfo(data.info);
        setFile(null);
        setPassword("");
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

  const eliminarCertificado = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/certificado", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Certificado eliminado correctamente");
        setHasCertificate(false);
        setCertificateInfo(null);
      } else {
        const error = await res.json();
        toast.error(error.message || "Error al eliminar el certificado");
      }
    } catch (error) {
      toast.error("Error al eliminar el certificado");
      console.error("Error al eliminar certificado:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar estados según la autenticación
  if (status === "loading") {
    return <div className="p-8 text-center">Cargando información...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-8 text-center">
        Debes iniciar sesión para administrar certificados
      </div>
    );
  }

  if (loadingCertInfo) {
    return (
      <div className="p-8 text-center">
        Cargando información del certificado...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold">Certificado Digital</h2>
        <span className="text-sm text-gray-400">
          Conecte su certificado digital para consultar facturas
        </span>
      </div>

      {hasCertificate ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Certificado actual</h3>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará el certificado digital asociado a tu
                      cuenta. Necesitarás cargar nuevamente el certificado para
                      operaciones que lo requieran.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={eliminarCertificado}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {certificateInfo && (
              <div className="space-y-2">
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

                {new Date(certificateInfo.validTo) < new Date() && (
                  <div className="flex items-center text-amber-600 gap-2 mt-2 p-2 bg-amber-50 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      Este certificado ha expirado.
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
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
            {loading ? (
              "Verificando..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Verificar y guardar certificado
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
