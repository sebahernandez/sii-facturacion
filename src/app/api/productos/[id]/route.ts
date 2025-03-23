import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// PUT: Editar producto
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  try {
    const actualizado = await prisma.producto.update({
      where: { id: parseInt(params.id) },
      data,
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE: Eliminar producto
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.producto.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
