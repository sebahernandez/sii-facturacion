import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  context: Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const data = await req.json();
  console.log("DATA RECIBIDA:", data);

  try {
    const actualizado = await prisma.producto.update({
      where: { id },
      data, // asegúrate que solo tenga los campos válidos
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
