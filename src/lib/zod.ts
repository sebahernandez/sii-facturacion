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

export const clienteSchema = z.object({
  rut: z
    .string()
    .min(1, { message: "El RUT es requerido" })
    .regex(/^[0-9]{7,8}-[0-9kK]{1}$/, {
      message: "El RUT debe tener un formato válido (ej: 76123456-7)",
    }),
  razonSocial: z
    .string()
    .min(1, { message: "La razón social es requerida" })
    .max(100, {
      message: "La razón social no puede exceder los 100 caracteres",
    }),
  giro: z
    .string()
    .min(1, { message: "El giro es requerido" })
    .max(100, { message: "El giro no puede exceder los 100 caracteres" }),
  direccion: z
    .string()
    .min(1, { message: "La dirección es requerida" })
    .max(200, { message: "La dirección no puede exceder los 200 caracteres" }),
  comuna: z
    .string()
    .min(1, { message: "La comuna es requerida" })
    .max(50, { message: "La comuna no puede exceder los 50 caracteres" }),
  ciudad: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
});

export const invoiceSchema = z.object({
  tipoDTE: z.number(),
  fechaEmision: z.string(),
  rutReceptor: z.string(),
  razonSocialReceptor: z.string(),
  direccionReceptor: z.string(),
  comunaReceptor: z.string(),
  contactoReceptor: z.string().optional(),
  observaciones: z.string().optional(),
  montoNeto: z.number(),
  iva: z.number(),
  montoTotal: z.number(),
  estado: z.enum(["EMITIDA", "NO_ENVIADA", "ENVIADA", "ANULADA"]),
  detalles: z.array(
    z.object({
      cantidad: z.number().min(1),
      descripcion: z.string().min(1),
      precioUnit: z.number().min(0),
      descuento: z.number().min(0),
      montoNeto: z.number().min(0),
    })
  ),
});

// Tipo inferido del schema
export type InvoiceInput = z.infer<typeof invoiceSchema>;
