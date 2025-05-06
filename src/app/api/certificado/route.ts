import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener información del certificado del usuario actual
export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "No autorizado",
          message: "Debes iniciar sesión para ver los detalles del certificado",
          hasCertificate: false,
        },
        { status: 401 }
      );
    }

    // Buscar al usuario con su token de certificado
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { certificateToken: true, name: true, email: true },
    });

    if (!user?.certificateToken) {
      return NextResponse.json({
        hasCertificate: false,
        message: "El usuario no tiene un certificado asociado",
      });
    }

    // Decodificar el token para extraer la información
    const tokenData = JSON.parse(
      Buffer.from(user.certificateToken, "base64").toString()
    );

    return NextResponse.json({
      hasCertificate: true,
      certificateInfo: {
        subject: tokenData.subject,
        issuer: tokenData.issuer,
        validFrom: tokenData.validFrom,
        validTo: tokenData.validTo,
        timestamp: tokenData.timestamp,
      },
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error al obtener información del certificado:", error);
    return NextResponse.json(
      { error: "Error al obtener información del certificado" },
      { status: 500 }
    );
  }
}

// Eliminar el certificado del usuario actual
export async function DELETE() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "No autorizado",
          message: "Debes iniciar sesión para eliminar el certificado",
        },
        { status: 401 }
      );
    }

    // Actualizar el usuario para eliminar su token de certificado
    await prisma.user.update({
      where: { id: session.user.id },
      data: { certificateToken: null },
    });

    return NextResponse.json({
      message: "Certificado eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar el certificado:", error);
    return NextResponse.json(
      { error: "Error al eliminar el certificado" },
      { status: 500 }
    );
  }
}
