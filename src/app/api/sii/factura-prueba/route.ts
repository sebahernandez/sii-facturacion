import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import * as xml2js from "xml2js";
import crypto from "crypto";

const prisma = new PrismaClient();

function decryptPrivateKey(
  encryptedKey: string,
  password: string,
  salt: string,
  iv: string
) {
  const key = crypto.scryptSync(password, salt, 32);
  const ivBuffer = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer);
  let decrypted = decipher.update(encryptedKey, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { password, ambiente = "certificacion" } = body;
    if (!password) {
      return NextResponse.json(
        { error: "Se requiere la contraseña del certificado" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        certificateToken: true,
        siiToken: true,
        rutEmpresa: true,
      },
    });

    if (!user?.certificateToken) {
      return NextResponse.json(
        { error: "El usuario no tiene certificado" },
        { status: 400 }
      );
    }

    if (!user.siiToken) {
      return NextResponse.json(
        { error: "Se debe solicitar un token al SII antes de enviar" },
        { status: 400 }
      );
    }

    const tokenData = JSON.parse(
      Buffer.from(user.certificateToken, "base64").toString()
    );

    let privateKeyPem: string;
    try {
      privateKeyPem = decryptPrivateKey(
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

    const siiUrl =
      ambiente === "produccion"
        ? "https://palena.sii.cl/cgi_dte/UPL/DTEUpload"
        : "https://maullin.sii.cl/cgi_dte/UPL/DTEUpload";

    // Generar un XML de factura muy básico para pruebas
    const dteXml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE version="1.0">
  <Documento ID="F1">
    <Encabezado>
      <IdDoc>
        <TipoDTE>33</TipoDTE>
        <Folio>1</Folio>
        <FchEmis>${new Date().toISOString().substring(0, 10)}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${user.rutEmpresa || tokenData.rut}</RUTEmisor>
        <RznSoc>Empresa de Prueba</RznSoc>
        <GiroEmis>Servicios</GiroEmis>
        <DirOrigen>Direccion</DirOrigen>
        <CmnaOrigen>Comuna</CmnaOrigen>
        <CiudadOrigen>Ciudad</CiudadOrigen>
      </Emisor>
      <Receptor>
        <RUTRecep>99999999-9</RUTRecep>
        <RznSocRecep>Cliente de Prueba</RznSocRecep>
        <DirRecep>Direccion</DirRecep>
        <CmnaRecep>Comuna</CmnaRecep>
      </Receptor>
      <Totales>
        <MntNeto>1000</MntNeto>
        <TasaIVA>19</TasaIVA>
        <IVA>190</IVA>
        <MntTotal>1190</MntTotal>
      </Totales>
    </Encabezado>
    <Detalle>
      <NroLinDet>1</NroLinDet>
      <NmbItem>Item de prueba</NmbItem>
      <QtyItem>1</QtyItem>
      <PrcItem>1000</PrcItem>
    </Detalle>
  </Documento>
</DTE>`;

    // Firmar XML - en este ejemplo no se implementa firma real
    const xmlFirmado = dteXml; // TODO: aplicar firma digital

    const formData = new FormData();
    const [rut, dv] = (user.rutEmpresa || tokenData.rut).split("-");
    formData.append("rutSender", rut);
    formData.append("dvSender", dv);
    formData.append("rutCompany", rut);
    formData.append("dvCompany", dv);
    formData.append("archivo", new Blob([xmlFirmado], { type: "text/xml" }), "dte.xml");
    formData.append("token", user.siiToken);

    const response = await fetch(siiUrl, {
      method: "POST",
      body: formData as any,
    });

    const text = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        { error: `Error HTTP ${response.status}`, detalle: text },
        { status: response.status }
      );
    }

    // Intentar parsear el XML de respuesta
    let parsed: any = null;
    try {
      parsed = await xml2js.parseStringPromise(text);
    } catch {
      // ignorar error de parseo, devolver texto
    }

    return NextResponse.json({ ok: true, respuesta: parsed || text });
  } catch (error) {
    console.error("Error al enviar factura de prueba:", error);
    return NextResponse.json(
      { error: "Error al enviar factura" },
      { status: 500 }
    );
  }
}

