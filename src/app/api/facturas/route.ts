import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient, EstadoFactura } from "@prisma/client";
import { invoiceSchema } from "@/lib/zod";
import { Factura } from "@/types/factura";

const prisma = new PrismaClient();

// Obtener todas las facturas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const facturas = await prisma.factura.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        detalles: true,
      },
      orderBy: {
        fechaEmision: "desc",
      },
    });

    return NextResponse.json(facturas);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener facturas" },
      { status: 500 }
    );
  }
}
// Crear una nueva factura
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { ...facturaData } = data;
    console.log("facturaData", facturaData);

    const factura = await prisma.factura.create({
      data: {
        ...facturaData,
        user_id: session.user.id,
        detalles: {
          create: facturaData.detalles,
        },
      },
      include: {
        detalles: true,
      },
    });

    return NextResponse.json(factura, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear factura" },
      { status: 500 }
    );
  }
}
// Actualizar una factura
export async function PUT(request: Request) {
  try {
    // Obtener el ID de los parámetros de búsqueda
    const url = new URL(request.url);
    const idStr = url.searchParams.get("id");

    if (!idStr) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = (await request.json()) as Omit<
      Factura,
      "id" | "detalles" | "createdAt" | "updatedAt"
    > & {
      detalles: {
        cantidad: number;
        descripcion: string;
        precioUnit: number;
        descuento: number;
        montoNeto: number;
      }[];
      tipoDTE: string;
    };

    console.log("DATA RECIBIDA:", data);

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

    // Convertir la cadena de estado a un valor válido del enum EstadoFactura
    let estadoFactura: EstadoFactura;

    switch (data.estado) {
      case "EMITIDA":
        estadoFactura = EstadoFactura.EMITIDA;
        break;
      case "NO_ENVIADA":
        estadoFactura = EstadoFactura.NO_ENVIADA;
        break;
      case "ENVIADA":
        estadoFactura = EstadoFactura.ENVIADA;
        break;
      case "ANULADA":
        estadoFactura = EstadoFactura.ANULADA;
        break;
      default:
        // Si el valor no coincide con ninguno del enum, usar un valor por defecto
        estadoFactura = EstadoFactura.EMITIDA;
    }

    // Actualizar la factura
    const actualizado = await prisma.factura.update({
      where: {
        id,
        user_id: session.user.id,
      },
      data: {
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
        estado: estadoFactura, // Usamos el valor del enum en lugar del string
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
// Eliminación de una factura
export async function DELETE(request: Request) {
  try {
    // Obtener el ID de los parámetros de búsqueda
    const url = new URL(request.url);
    const idStr = url.searchParams.get("id");

    if (!idStr) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    const idNumber = Number(idStr);
    if (isNaN(idNumber)) {
      console.log("ID inválido: no es un número");
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    console.log("ID a eliminar:", idNumber);
    console.log("Tipo de dato:", typeof idNumber);

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Primero, eliminar los detalles relacionados
    await prisma.detalleFactura.deleteMany({
      where: {
        factura_id: idNumber,
      },
    });

    // Luego, eliminar la factura
    await prisma.factura.delete({
      where: {
        id: idNumber,
        user_id: session.user.id,
      },
    });

    return NextResponse.json({ message: "Factura eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar factura:", error);
    return NextResponse.json(
      { error: "Error al eliminar factura" },
      { status: 500 }
    );
  }
}
