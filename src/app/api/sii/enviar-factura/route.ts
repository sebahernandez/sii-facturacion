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

    const { id, password, ambiente = "certificacion" } = await req.json();
    if (!id || !password) {
      return NextResponse.json(
        { error: "Faltan datos para enviar la factura" },
        { status: 400 }
      );
    }

    const factura = await prisma.factura.findFirst({
      where: { id, user_id: session.user.id },
      include: { detalles: true, user: true },
    });

    if (!factura) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    const user = factura.user;
    if (!user.certificateToken) {
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

    const tokenData = JSON.parse(Buffer.from(user.certificateToken, "base64").toString());

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

    let detallesXml = "";
    factura.detalles.forEach((d, idx) => {
      detallesXml += `\n    <Detalle>\n      <NroLinDet>${idx + 1}</NroLinDet>\n      <NmbItem>${d.descripcion}</NmbItem>\n      <QtyItem>${d.cantidad}</QtyItem>\n      <PrcItem>${d.precioUnit}</PrcItem>\n      <MontoItem>${d.montoNeto}</MontoItem>\n    </Detalle>`;
    });

    const dteXml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE version="1.0">
  <Documento ID="F${factura.id}">
    <Encabezado>
      <IdDoc>
        <TipoDTE>${factura.tipoDTE}</TipoDTE>
        <Folio>${factura.id}</Folio>
        <FchEmis>${factura.fechaEmision.toISOString().substring(0, 10)}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${factura.rutEmisor}</RUTEmisor>
        <RznSoc>${factura.razonSocialEmisor}</RznSoc>
        <GiroEmis>${user.giro || ""}</GiroEmis>
        <DirOrigen>${user.direccion || ""}</DirOrigen>
        <CmnaOrigen></CmnaOrigen>
      </Emisor>
      <Receptor>
        <RUTRecep>${factura.rutReceptor}</RUTRecep>
        <RznSocRecep>${factura.razonSocialReceptor}</RznSocRecep>
        <DirRecep>${factura.direccionReceptor}</DirRecep>
        <CmnaRecep>${factura.comunaReceptor}</CmnaRecep>
      </Receptor>
      <Totales>
        <MntNeto>${factura.montoNeto}</MntNeto>
        <TasaIVA>19</TasaIVA>
        <IVA>${factura.iva}</IVA>
        <MntTotal>${factura.montoTotal}</MntTotal>
      </Totales>
    </Encabezado>${detallesXml}
  </Documento>
</DTE>`;

    const xmlFirmado = dteXml; // TODO: aplicar firma digital usando privateKeyPem

    const formData = new FormData();
    const [rut, dv] = factura.rutEmisor.split("-");
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

    await prisma.factura.update({
      where: { id: factura.id },
      data: { estado: "ENVIADA" },
    });

    let parsed: any = null;
    try {
      parsed = await xml2js.parseStringPromise(text);
    } catch {}

    return NextResponse.json({ ok: true, respuesta: parsed || text });
  } catch (error) {
    console.error("Error al enviar factura:", error);
    return NextResponse.json({ error: "Error al enviar factura" }, { status: 500 });
  }
}
