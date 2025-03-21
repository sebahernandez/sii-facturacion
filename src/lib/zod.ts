"use client";

import { z } from "zod";

//esquema de validación con Zod
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Ingrese un email válido" })
    .min(1, { message: "El email es requerido" })
    .email({ message: "Ingrese un email válido" }),
  password: z
    .string()
    .min(1, { message: "La contraseña es requerida" })
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
});
