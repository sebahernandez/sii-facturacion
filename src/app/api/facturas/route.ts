import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient, EstadoFactura } from "@prisma/client";
import { invoiceSchema } from "@/lib/zod";

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
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
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

    const factura = await prisma.factura.create({
      data: {
        ...data,
        user_id: session.user.id,
        detalles: {
          create: data.detalles,
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

// Actualizar una factura existente
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el ID desde los query params
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

    // Verificar que la factura existe y pertenece al usuario
    const existingFactura = await prisma.factura.findFirst({
      where: {
        id,
        user_id: session.user.id,
      },
    });

    if (!existingFactura) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    const data = await request.json();

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

    // Convertir el estado a enum
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
        estadoFactura = EstadoFactura.NO_ENVIADA;
    }

    // Actualizar la factura
    const actualizado = await prisma.factura.update({
      where: {
        id,
        user_id: session.user.id,
      },
      data: {
        tipoDTE: data.tipoDTE,
        fechaEmision: new Date(data.fechaEmision),
        rutReceptor: data.rutReceptor,
        razonSocialReceptor: data.razonSocialReceptor,
        direccionReceptor: data.direccionReceptor,
        comunaReceptor: data.comunaReceptor,
        contactoReceptor: data.contactoReceptor,
        montoNeto: data.montoNeto,
        iva: data.iva,
        montoTotal: data.montoTotal,
        estado: estadoFactura,
        observaciones: data.observaciones,
        detalles: {
          deleteMany: {},
          create: data.detalles.map(
            (detalle: {
              cantidad: number;
              descripcion: string;
              precioUnit: number;
              descuento: number;
              montoNeto: number;
            }) => ({
              cantidad: detalle.cantidad,
              descripcion: detalle.descripcion,
              precioUnit: detalle.precioUnit,
              descuento: detalle.descuento,
              montoNeto: detalle.montoNeto,
            })
          ),
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

// Eliminar una factura
export async function DELETE(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Eliminar los detalles y la factura
    await prisma.detalleFactura.deleteMany({
      where: {
        factura_id: idNumber,
      },
    });

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
