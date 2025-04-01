import { z } from "zod";

//esquema de validación con Zod
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El email es requerido" })
    .email({ message: "Ingrese un email válido" })
    .max(254, { message: "El email no puede exceder los 254 caracteres" })
    .trim(), // Elimina espacios en blanco
  password: z
    .string()
    .min(1, { message: "La contraseña es requerida" })
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(128, { message: "La contraseña no puede exceder los 128 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
      {
        message:
          "La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)",
      }
    )
    .trim(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, {
      message: "El nombre debe tener al menos 2 caracteres",
    }),
    email: z
      .string()
      .min(1, { message: "El email es requerido" })
      .email({ message: "Ingrese un email válido" })
      .max(254, { message: "El email no puede exceder los 254 caracteres" })
      .trim(),
    password: z
      .string()
      .min(1, { message: "La contraseña es requerida" })
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .max(128, {
        message: "La contraseña no puede exceder los 128 caracteres",
      })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
        {
          message:
            "La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)",
        }
      )
      .trim(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
