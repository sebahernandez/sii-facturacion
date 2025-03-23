import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// obtener un producto
export async function GET() {
  // Obtener la sesión del usuario
  const session = await getServerSession(authOptions);
  // Si no hay sesión, retornar un error 401
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  const productos = await prisma.producto.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(productos);
}

// crear un producto
export async function POST(req: Request) {
  // Obtener la sesión del usuario
  const session = await getServerSession(authOptions);
  // Si no hay sesión, retornar un error 401
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  // Obtener el cuerpo de la petición
  const body = await req.json();

  // Buscar el usuario en la base de datos
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Verificar que el usuario no sea nulo
  if (!user)
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 }
    );

  // Crear un nuevo producto
  const nuevoProducto = await prisma.producto.create({
    data: {
      ...body,
      user: { connect: { email: session.user.email } },
    },
  });

  // Retornar el producto creado
  return NextResponse.json(nuevoProducto);
}
