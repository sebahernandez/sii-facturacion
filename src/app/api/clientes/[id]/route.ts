import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { clienteSchema } from "@/lib/zod";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Obtener la sesión del usuario
  const session = await getServerSession(authOptions);

  // Si no hay sesión, retornar un error 401
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // Verificar si el cliente existe y pertenece al usuario
    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        id,
        user: { email: session.user.email },
      },
    });

    if (!clienteExistente) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Obtener y validar los datos de actualización
    const body = await req.json();
    const validacion = clienteSchema.safeParse(body);

    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.format() },
        { status: 400 }
      );
    }

    // Verificar si el nuevo RUT ya existe en otro cliente
    if (body.rut !== clienteExistente.rut) {
      const rutExistente = await prisma.cliente.findFirst({
        where: {
          rut: body.rut,
          NOT: { id },
        },
      });

      if (rutExistente) {
        return NextResponse.json(
          { error: "Ya existe otro cliente con este RUT" },
          { status: 409 }
        );
      }
    }

    // Actualizar el cliente
    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: validacion.data,
    });

    return NextResponse.json(clienteActualizado);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json(
      { error: "Error al actualizar el cliente" },
      { status: 500 }
    );
  }
}
