import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Producto } from "@/types/producto";

const prisma = new PrismaClient();

// obtener productos
export async function GET() {
  // Obtener la sesión del usuario
  const session = await getServerSession(authOptions);
  // Si no hay sesión, retornar un error 401
  if (!session?.user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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

// crear un producto
export async function POST(req: Request) {
  // Obtener la sesión del usuario
  const session = await getServerSession(authOptions);
  // Si no hay sesión, retornar un error 401
  if (!session?.user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    // Obtener el cuerpo de la petición
    const body = await req.json();

    // Crear un nuevo producto
    const nuevoProducto = await prisma.producto.create({
      data: {
        ...body,
        user_id: session.user.id,
      },
    });

    // Retornar el producto creado
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}

// Actualizar un producto existente
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

    // Obtener los datos del producto a actualizar
    const data = (await request.json()) as Omit<Producto, "id">;

    // Actualizar el producto
    const productoActualizado = await prisma.producto.update({
      where: {
        id,
        user_id: session.user.id,
      },
      data: {
        codigo: data.codigo,
        descripcion: data.descripcion,
        cantidad: data.cantidad,
        unidadMedida: data.unidadMedida,
        precioUnitario: data.precioUnitario,
        descuento: data.descuento,
        montoNeto: data.montoNeto,
        iva: data.iva,
        montoTotal: data.montoTotal,
      },
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

// Eliminar un producto existente
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
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Eliminar el producto
    await prisma.producto.delete({
      where: {
        id: idNumber,
        user_id: session.user.id,
      },
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
