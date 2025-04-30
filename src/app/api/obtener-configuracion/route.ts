import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Este endpoint obtiene los datos de empresa del usuario autenticado
export async function GET() {
  try {
    // Verificar que el usuario esté autenticado
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener los datos del usuario de la base de datos
    const usuario = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        rutEmpresa: true,
        razonSocial: true,
        giro: true,
        direccion: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Retornar los datos del usuario
    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    );
  }
}
