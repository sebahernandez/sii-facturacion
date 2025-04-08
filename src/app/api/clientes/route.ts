import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { clienteSchema } from "@/lib/zod";

const prisma = new PrismaClient();

// Obtener todos los clientes del usuario autenticado
export async function GET() {
  // Obtener la sesión del usuario
  const session = await getServerSession(authOptions);

  // Si no hay sesión, retornar un error 401
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const clientes = await prisma.cliente.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { error: "Error al obtener los clientes" },
      { status: 500 }
    );
  }
}

// Crear un nuevo cliente
export async function POST(req: Request) {
  // Obtener la sesión del usuario
  const session = await getServerSession(authOptions);

  // Si no hay sesión, retornar un error 401
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Obtener el cuerpo de la petición
    const body = await req.json();

    // Validar los datos con Zod
    const validacion = clienteSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.format() },
        { status: 400 }
      );
    }

    // Verificar si ya existe un cliente con el mismo RUT
    const clienteExistente = await prisma.cliente.findUnique({
      where: { rut: body.rut },
    });

    if (clienteExistente) {
      return NextResponse.json(
        { error: "Ya existe un cliente con este RUT" },
        { status: 409 }
      );
    }

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Crear el nuevo cliente
    const nuevoCliente = await prisma.cliente.create({
      data: {
        ...validacion.data,
        user: { connect: { email: session.user.email } },
      },
    });

    return NextResponse.json(nuevoCliente, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return NextResponse.json(
      { error: "Error al crear el cliente" },
      { status: 500 }
    );
  }
}
