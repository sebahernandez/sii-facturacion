import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import * as forge from "node-forge";
import crypto from "crypto";
import * as xml2js from "xml2js";

const prisma = new PrismaClient();

// Función para firmar un XML con un certificado digital
async function signXML(
  xml: string,
  privateKeyPem: string,
  certPem: string
): Promise<string> {
  try {
    // Nota: Esta es una implementación simplificada. Para producción
    // es recomendable usar una biblioteca especializada para firmar XML
    // como xml-crypto o xmldsigjs

    // En este ejemplo, usamos node-forge para la firma
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // Crear una firma SHA-1 con RSA (requerido por SII)
    const md = forge.md.sha1.create();
    md.update(xml, "utf8");

    const signature = privateKey.sign(md);
    const signatureBase64 = forge.util.encode64(signature);

    // Extraer solo el certificado (sin headers)
    const certClean = certPem
      .replace(
        /-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n|\r/g,
        ""
      )
      .trim();

    // Construir el XML firmado
    const signedXml = xml.replace(
      "</item>",
      `
      <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
        <SignedInfo>
          <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
          <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
          <Reference URI="">
            <Transforms>
              <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
            </Transforms>
            <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
            <DigestValue>${forge.util.encode64(
              md.digest().getBytes()
            )}</DigestValue>
          </Reference>
        </SignedInfo>
        <SignatureValue>${signatureBase64}</SignatureValue>
        <KeyInfo>
          <X509Data>
            <X509Certificate>${certClean}</X509Certificate>
          </X509Data>
        </KeyInfo>
      </Signature>
    </item>`
    );

    return signedXml;
  } catch (error) {
    console.error("Error firmando XML:", error);
    throw new Error("Error al firmar el XML");
  }
}

// Función para descifrar la clave privada almacenada
function descifrarClavePrivada(
  encryptedKeyPem: string,
  password: string,
  salt: string,
  iv: string
): string {
  const key = crypto.scryptSync(password, salt, 32);
  const ivBuffer = Buffer.from(iv, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer);
  let decrypted = decipher.update(encryptedKeyPem, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Endpoint para obtener el token de autenticación del SII
export async function POST(req: NextRequest) {
  try {
    // Verificar que el usuario esté autenticado
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Leer el cuerpo de la solicitud
    const body = await req.json();
    const { password, ambiente = "certificacion" } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Se requiere la contraseña del certificado" },
        { status: 400 }
      );
    }

    // Obtener el usuario y su certificado
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        certificateToken: true,
        siiSeed: true,
        siiSeedTimestamp: true,
        rutEmpresa: true,
      },
    });

    if (!user?.certificateToken) {
      return NextResponse.json(
        { error: "No se encontró un certificado asociado a tu cuenta" },
        { status: 400 }
      );
    }

    if (!user.siiSeed) {
      return NextResponse.json(
        {
          error:
            "No se encontró una semilla válida. Solicita una semilla primero.",
        },
        { status: 400 }
      );
    }

    // Verificar si la semilla ha expirado (5 minutos)
    const seedTimestamp = user.siiSeedTimestamp ?? new Date(0);
    const seedAge = Date.now() - seedTimestamp.getTime();
    if (seedAge > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "La semilla ha expirado. Solicita una nueva semilla." },
        { status: 400 }
      );
    }

    // Decodificar el token del certificado
    const tokenData = JSON.parse(
      Buffer.from(user.certificateToken, "base64").toString()
    );

    // Descifrar la clave privada usando la contraseña proporcionada
    let privateKeyPem;
    try {
      privateKeyPem = descifrarClavePrivada(
        tokenData.encryptedKeyPem,
        password,
        tokenData.salt,
        tokenData.iv
      );
    } catch {
      return NextResponse.json(
        { error: "Contraseña incorrecta para el certificado" },
        { status: 400 }
      );
    }

    // URLs del SII según ambiente
    const siiUrl =
      ambiente === "produccion"
        ? "https://palena.sii.cl/DTEWS/GetTokenFromSeed.jws?WSDL"
        : "https://maullin.sii.cl/DTEWS/GetTokenFromSeed.jws?WSDL";

    // Crear XML para solicitar token
    const rutEmpresa = user.rutEmpresa || tokenData.rut;
    if (!rutEmpresa) {
      return NextResponse.json(
        { error: "No se pudo determinar el RUT de la empresa" },
        { status: 400 }
      );
    }

    // XML para solicitar token con la semilla
    const xmlToken = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
          <getToken xmlns="http://DefaultNamespace">
            <item>
              <Semilla>${user.siiSeed}</Semilla>
            </item>
          </getToken>
        </soap:Body>
      </soap:Envelope>
    `;

    // Firmar el XML con el certificado
    const xmlFirmado = await signXML(
      xmlToken,
      privateKeyPem,
      tokenData.certPem
    );

    // Realizar la petición al SII usando fetch en lugar de axios
    const response = await fetch(siiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: "getToken",
      },
      body: xmlFirmado,
    });

    if (!response.ok) {
      throw new Error(
        `Error al solicitar token: ${response.status} ${response.statusText}`
      );
    }

    // Parsear respuesta XML
    const responseText = await response.text();
    const result = await xml2js.parseStringPromise(responseText);

    // Extraer el token del XML
    const tokenXml =
      result["soap:Envelope"]["soap:Body"][0]["getTokenResponse"][0][
        "getTokenReturn"
      ][0];
    const tokenResult = await xml2js.parseStringPromise(tokenXml);

    if (tokenResult.SII_RESP.RESP_HDR[0].ESTADO[0] !== "00") {
      return NextResponse.json(
        {
          error: "Error al obtener token del SII",
          detalle: tokenResult.SII_RESP.RESP_HDR[0].GLOSA[0],
        },
        { status: 500 }
      );
    }

    const token = tokenResult.SII_RESP.RESP_BODY[0].TOKEN[0];

    // Guardar el token en la base de datos asociado al usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        siiToken: token,
        siiTokenTimestamp: new Date(),
        // Limpiar la semilla ya que solo se usa una vez
        siiSeed: null,
        siiSeedTimestamp: null,
      },
    });

    return NextResponse.json({
      token,
      timestamp: new Date().toISOString(),
      rutEmpresa,
      message: "Token obtenido correctamente",
    });
  } catch (error) {
    console.error("Error al solicitar token al SII:", error);
    return NextResponse.json(
      {
        error: "Error al solicitar token al SII",
        detalle: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
