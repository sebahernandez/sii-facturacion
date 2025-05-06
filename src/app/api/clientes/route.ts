import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { clienteSchema } from "@/lib/zod";
import { Cliente } from "@/types/cliente";

const prisma = new PrismaClient();

// Obtener todos los clientes del usuario autenticado
export async function GET() {
  const session = await getServerSession(authOptions);

  // Si no hay sesión, retornar un error 401
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const clientes = await prisma.cliente.findMany({
      where: { user_id: session.user.id },
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
  if (!session?.user) {
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

    // Crear el nuevo cliente
    const nuevoCliente = await prisma.cliente.create({
      data: {
        ...validacion.data,
        user_id: session.user.id,
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

// Actualizar un cliente existente
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

    // Obtener los datos del cliente a actualizar
    const data = (await request.json()) as Omit<
      Cliente,
      "id" | "createdAt" | "updatedAt" | "user_id"
    >;

    // Validar los datos con Zod
    const validation = clienteSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Datos inválidos",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    // Verificar si existe otro cliente con el mismo RUT (que no sea el actual)
    const existingClient = await prisma.cliente.findFirst({
      where: {
        rut: data.rut,
        id: { not: id },
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Ya existe otro cliente con este RUT" },
        { status: 409 }
      );
    }

    // Actualizar el cliente
    const clienteActualizado = await prisma.cliente.update({
      where: {
        id,
        user_id: session.user.id,
      },
      data: {
        rut: data.rut,
        razonSocial: data.razonSocial,
        giro: data.giro,
        direccion: data.direccion,
        comuna: data.comuna,
        ciudad: data.ciudad,
        contacto: data.contacto,
        telefono: data.telefono,
      },
    });

    return NextResponse.json(clienteActualizado);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}

// Eliminar un cliente existente
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

    // Eliminar el cliente
    await prisma.cliente.delete({
      where: {
        id: idNumber,
        user_id: session.user.id,
      },
    });

    return NextResponse.json({ message: "Cliente eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    );
  }
}
