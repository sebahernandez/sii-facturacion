import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import * as xml2js from "xml2js";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Detectar ambiente (default: certificación)
    const url = new URL(req.url);
    const ambiente = url.searchParams.get("ambiente") || "certificacion";

    const siiUrl =
      ambiente === "produccion"
        ? "https://palena.sii.cl/DTEWS/CrSeed.jws"
        : "https://maullin.sii.cl/DTEWS/CrSeed.jws";

    // XML SOAP de solicitud
    const xmlSeed = `
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
                   xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <SOAP-ENV:Body>
    <m:getSeed xmlns:m="https://palena.sii.cl/DTEWS/CrSeed.jws"/>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`.trim();

    // Realizar petición al SII
    const response = await fetch(siiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "",
      },
      body: xmlSeed,
    });

    const responseText = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Error HTTP ${response.status}: ${response.statusText}`,
          detalle: responseText,
        },
        { status: response.status }
      );
    }

    // Paso 1: Parsear el XML SOAP
    const soapParsed = await xml2js.parseStringPromise(responseText, {
      explicitArray: false,
      ignoreAttrs: true,
    });

    const encodedInnerXml =
      soapParsed?.Envelope?.Body?.getSeedResponse?.getSeedReturn;

    if (!encodedInnerXml) {
      throw new Error(
        "No se encontró el campo getSeedReturn en la respuesta SOAP."
      );
    }

    // Intentar extraer el campo getSeedReturn de manera más flexible
    const findField = (
      obj: Record<string, unknown>,
      field: string
    ): unknown => {
      if (!obj || typeof obj !== "object") return null;
      if (field in obj) return obj[field];
      for (const key in obj) {
        const value = obj[key];
        if (value && typeof value === "object") {
          const result = findField(value as Record<string, unknown>, field);
          if (result) return result;
        }
      }
      return null;
    };

    const getSeedReturn = findField(soapParsed, "getSeedReturn");
    if (!getSeedReturn) {
      console.error(
        "No se encontró el campo getSeedReturn en la respuesta SOAP:",
        JSON.stringify(soapParsed, null, 2)
      );
      throw new Error(
        "No se encontró el campo getSeedReturn en la respuesta SOAP"
      );
    }

    console.log("Campo getSeedReturn encontrado:", getSeedReturn);

    // Extraer la semilla del campo getSeedReturn
    const semillaRegex = /<SEMILLA>(.*?)<\/SEMILLA>/i;
    const semillaMatch = (
      typeof getSeedReturn === "string" ? getSeedReturn : ""
    ).match(semillaRegex);

    if (semillaMatch && semillaMatch[1]) {
      const semilla = semillaMatch[1];
      console.log("Semilla extraída con éxito:", semilla);

      // Guardar la semilla en la base de datos
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          siiSeed: semilla,
          siiSeedTimestamp: new Date(),
        },
      });

      return NextResponse.json({
        semilla,
        timestamp: new Date().toISOString(),
        message: "Semilla obtenida correctamente",
      });
    }

    throw new Error("No se pudo extraer la semilla del campo getSeedReturn");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error al solicitar semilla al SII:", errorMessage);
    return NextResponse.json(
      {
        error: "Error al solicitar semilla al SII",
        detalle: errorMessage,
      },
      { status: 500 }
    );
  }
}
