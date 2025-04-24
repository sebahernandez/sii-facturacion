import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRut(rut: string): string {
  // Eliminar puntos y guión si existen
  let clean = rut.replace(/[.-]/g, "");

  // Validar que solo contenga números y opcionalmente una K al final
  if (!/^[0-9]+[kK]?$/.test(clean)) {
    return clean;
  }

  // Separar el dígito verificador
  const dv = clean.slice(-1);
  const rutNumeros = clean.slice(0, -1);

  return `${rutNumeros}-${dv}`;
}
