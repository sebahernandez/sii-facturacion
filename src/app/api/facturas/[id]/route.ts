import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { invoiceSchema } from "@/lib/zod";

const prisma = new PrismaClient();

export async function PUT(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // Verificar autenticación
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const data: {
    folio: string;
    tipoDTE: string;
    fechaEmision: string;
    razonSocialEmisor: string;
    rutEmisor: string;
    rutReceptor: string;
    razonSocialReceptor: string;
    direccionReceptor: string;
    comunaReceptor: string;
    ciudadReceptor: string;
    montoNeto: number;
    iva: number;
    montoTotal: number;
    estado: string;
    observaciones: string;
    detalles: {
      cantidad: number;
      descripcion: string;
      precioUnit: number;
      descuento: number;
      montoNeto: number;
    }[];
  } = await req.json();
  console.log("DATA RECIBIDA:", data);

  try {
    // Validar datos con Zod
    const validation = invoiceSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Datos inválidos",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    // Actualizar la factura
    const actualizado = await prisma.factura.update({
      where: {
        id,
        user_id: session.user.id,
      },
      data: {
        folio: parseInt(data.folio, 10),
        tipoDTE: parseInt(data.tipoDTE, 10),
        fechaEmision: data.fechaEmision,
        razonSocialEmisor: data.razonSocialEmisor,
        rutEmisor: data.rutEmisor,
        rutReceptor: data.rutReceptor,
        razonSocialReceptor: data.razonSocialReceptor,
        direccionReceptor: data.direccionReceptor,
        comunaReceptor: data.comunaReceptor,
        ciudadReceptor: data.ciudadReceptor,
        montoNeto: data.montoNeto,
        iva: data.iva,
        montoTotal: data.montoTotal,
        estado: data.estado,
        observaciones: data.observaciones,
        detalles: {
          deleteMany: {},
          createMany: {
            data: data.detalles.map((detalle) => ({
              cantidad: detalle.cantidad,
              descripcion: detalle.descripcion,
              precioUnit: detalle.precioUnit,
              descuento: detalle.descuento,
              montoNeto: detalle.montoNeto,
            })),
          },
        },
      },
      include: {
        detalles: true,
      },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar factura:", error);
    return NextResponse.json(
      { error: "Error al actualizar factura" },
      { status: 500 }
    );
  }
}
