import { toast } from "sonner";

export interface DatosEmpresa {
  rut: string;
  razonSocial: string;
  giro: string;
  direccion: string;
  documentos: string[];
}

// Guardar la configuración de la empresa
export async function guardarConfiguracion(datosEmpresa: {
  rut: string;
  razonSocial: string;
  giro: string;
  direccion: string;
  documentos: string[];
}) {
  try {
    const response = await fetch("/api/guardar-configuracion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosEmpresa),
    });

    if (!response.ok) {
      throw new Error("No se pudo guardar la configuración");
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("No se pudo guardar la configuración.");
  }
}

// Obtener el token de SII
export async function obtenerToken(
  file: File,
  password: string,
  setToken: (token: string) => void,
  setLoading: (loading: boolean) => void
) {
  if (!file || !password) {
    toast.info("Debe seleccionar un archivo y una contraseña");
    return;
  }

  setLoading(true);
  const formData = new FormData();
  formData.append("certificado", file);
  formData.append("password", password);

  try {
    const response = await fetch("/api/obtener-token", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.token) {
      setToken(data.token);
      toast.success("Token obtenido correctamente");
    } else {
      throw new Error("No se pudo obtener el token");
    }
  } catch (error) {
    console.error(error);
    toast.error("Ocurrió un error al obtener el token");
  }
  setLoading(false);
}
