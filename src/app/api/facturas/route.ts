import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

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
