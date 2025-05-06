import { NextRequest, NextResponse } from "next/server";
import * as forge from "node-forge";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación desde el servidor
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "No autorizado",
          message: "Debes iniciar sesión para esta operación",
        },
        { status: 401 }
      );
    }

    // Crear un directorio temporal para guardar el archivo
    const tempDir = tmpdir();
    const tempFilePath = join(tempDir, `cert-${Date.now()}.pfx`);

    // Guardar el archivo recibido en el directorio temporal
    const formData = await req.formData();
    const pfxFile = formData.get("pfx") as File;
    const password = formData.get("password") as string;

    if (!pfxFile || !password) {
      return NextResponse.json(
        { error: "Falta el archivo del certificado o la contraseña" },
        { status: 400 }
      );
    }

    // Convertir el archivo a un ArrayBuffer y luego a un Buffer de Node
    const arrayBuffer = await pfxFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Guardar temporalmente el archivo
    await fs.writeFile(tempFilePath, buffer);

    // Leer el archivo como un string binario
    const pfxData = await fs.readFile(tempFilePath, { encoding: "binary" });

    try {
      // Intentar decodificar el PFX usando la contraseña proporcionada
      const p12Asn1 = forge.asn1.fromDer(pfxData);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

      // Extraer certificados y clave privada
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const pkeyBags = p12.getBags({
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
      });

      const certBagArray = certBags[forge.pki.oids.certBag];
      const pkeyBagArray = pkeyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

      if (
        !certBagArray ||
        !pkeyBagArray ||
        certBagArray.length === 0 ||
        pkeyBagArray.length === 0
      ) {
        throw new Error("No se pudo extraer el certificado o la clave privada");
      }

      const certificate = certBagArray[0];

      // Verificar que hay una clave privada (solo verificación)
      if (pkeyBagArray.length === 0) {
        throw new Error("No se encontró clave privada");
      }

      if (!certificate.cert) {
        throw new Error("Certificado inválido");
      }

      // Obtener información del certificado
      const cert = certificate.cert;

      // Verificar que los campos necesarios existan
      if (!cert.subject || !cert.issuer || !cert.validity) {
        throw new Error("Estructura del certificado inválida");
      }

      let subject = "Desconocido";
      let issuer = "Desconocido";

      try {
        subject = cert.subject.getField("CN")?.value || "Desconocido";
      } catch {
        console.warn("No se pudo obtener el campo CN del subject");
      }

      try {
        issuer = cert.issuer.getField("CN")?.value || "Desconocido";
      } catch {
        console.warn("No se pudo obtener el campo CN del issuer");
      }

      const validFrom = cert.validity.notBefore;
      const validTo = cert.validity.notAfter;

      // Generar un token para representar la sesión del certificado
      const token = Buffer.from(
        JSON.stringify({
          subject,
          issuer,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          timestamp: Date.now(),
        })
      ).toString("base64");

      // Guardar el token en la base de datos asociado al usuario actual
      await prisma.user.update({
        where: { id: session.user.id },
        data: { certificateToken: token },
      });

      // Eliminar el archivo temporal
      await fs.unlink(tempFilePath);

      return NextResponse.json({
        message: "Certificado verificado correctamente",
        token,
        info: {
          subject,
          issuer,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
        },
      });
    } catch {
      // Eliminar el archivo temporal en caso de error
      await fs.unlink(tempFilePath);
      return NextResponse.json(
        { error: "Contraseña incorrecta o certificado inválido" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error al procesar el certificado:", error);
    return NextResponse.json(
      { error: "Error al procesar el certificado" },
      { status: 500 }
    );
  }
}
