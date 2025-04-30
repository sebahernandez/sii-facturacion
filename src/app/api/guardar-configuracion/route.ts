import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Este endpoint guarda los datos de empresa (RUT, razón social, giro, dirección) del usuario autenticado
export async function POST(req: Request) {
  try {
    // Verificar que el usuario esté autenticado
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener los datos del cuerpo de la solicitud
    const { rut, razonSocial, giro, direccion } = await req.json();

    // Actualizar los datos del usuario en la base de datos
    const usuarioActualizado = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        rutEmpresa: rut,
        razonSocial: razonSocial,
        giro: giro,
        direccion: direccion,
      },
    });

    // Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Configuración guardada correctamente",
      data: {
        rutEmpresa: usuarioActualizado.rutEmpresa,
        razonSocial: usuarioActualizado.razonSocial,
        giro: usuarioActualizado.giro,
        direccion: usuarioActualizado.direccion,
      },
    });
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    return NextResponse.json(
      { error: "Error al guardar la configuración" },
      { status: 500 }
    );
  }
}
