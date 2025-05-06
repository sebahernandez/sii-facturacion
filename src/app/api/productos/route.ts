import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Producto } from "@/types/producto";
import { headers, cookies } from "next/headers";

import { PrismaClient } from "@prisma/client";
// Singleton de Prisma para evitar múltiples instancias en desarrollo
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  // 1) Inicializar contexto HTTP
  void (await headers());
  void (await cookies());

  // 2) Leer sesión
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // 3) Lógica de negocio
  try {
    const productos = await prisma.producto.findMany({
      where: { user_id: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  void (await headers());
  void (await cookies());

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const nuevoProducto = await prisma.producto.create({
      data: { ...body, user_id: session.user.id },
    });
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  void (await headers());
  void (await cookies());

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const idStr = url.searchParams.get("id");
  if (!idStr) {
    return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
  }
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const data = (await req.json()) as Omit<Producto, "id">;
    const productoActualizado = await prisma.producto.update({
      where: { id, user_id: session.user.id },
      data,
    });
    return NextResponse.json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  void (await headers());
  void (await cookies());

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const idStr = url.searchParams.get("id");
  if (!idStr) {
    return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
  }
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.producto.delete({
      where: { id, user_id: session.user.id },
    });
    return NextResponse.json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
