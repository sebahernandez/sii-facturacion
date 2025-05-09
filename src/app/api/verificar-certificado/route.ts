import { NextRequest, NextResponse } from "next/server";
import * as forge from "node-forge";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

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
      const privateKey = pkeyBagArray[0];

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
      let rut = "";

      try {
        subject = cert.subject.getField("CN")?.value || "Desconocido";
        // Intentar extraer el RUT del subject
        const rutMatch = subject.match(/\d{1,2}\.\d{3}\.\d{3}[-‐][\dkK]/);
        if (rutMatch) {
          rut = rutMatch[0];
        }
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

      // Convertir el certificado a PEM para usarlo en solicitudes al SII
      const certPem = forge.pki.certificateToPem(cert);

      // Obtener la clave privada y convertirla a PEM
      const keyPem = forge.pki.privateKeyInfoToPem(privateKey.asn1);

      // Encriptar el PEM de la clave privada para guardarla de forma segura
      // Usamos una clave derivada de la contraseña del usuario + un salt
      const salt = crypto.randomBytes(16).toString("hex");
      const key = crypto.scryptSync(password, salt, 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      let encryptedKeyPem = cipher.update(keyPem, "utf8", "base64");
      encryptedKeyPem += cipher.final("base64");

      // Generar un token para representar la sesión del certificado con más datos
      const token = Buffer.from(
        JSON.stringify({
          subject,
          issuer,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          timestamp: Date.now(),
          rut: rut,
          certPem: certPem,
          // Guardamos datos de encriptación para poder desencriptar después
          encryptedKeyPem: encryptedKeyPem,
          salt: salt,
          iv: iv.toString("hex"),
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
          rut: rut || "No identificado",
        },
      });
    } catch (error) {
      // Eliminar el archivo temporal en caso de error
      await fs.unlink(tempFilePath);
      console.error("Error al procesar el certificado:", error);
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
