import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRut(rut: string): string {
  // Eliminar caracteres no deseados y obtener dígito verificador
  const rutLimpio = rut.replace(/[^0-9kK]/g, "");

  // Si el RUT está vacío, retornar vacío
  if (rutLimpio.length === 0) return "";

  // Separar el número del dígito verificador
  const dv = rutLimpio.slice(-1);
  const numero = rutLimpio.slice(0, -1);

  // Si no hay número, retornar solo el dígito verificador
  if (numero.length === 0) return dv;

  // Formatear con puntos y guión
  return numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
