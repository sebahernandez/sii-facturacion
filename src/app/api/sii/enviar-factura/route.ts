import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id, ambiente = "certificacion" } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de factura requerido" },
        { status: 400 }
      );
    }

    // Obtener la factura con sus detalles
    const factura = await prisma.factura.findFirst({
      where: { 
        id: parseInt(id),
        user_id: session.user.id 
      },
      include: {
        detalles: true,
        user: {
          select: {
            rutEmpresa: true,
            razonSocial: true,
            giro: true,
            direccion: true
          }
        }
      }
    });

    if (!factura) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    // Generar XML del DTE
    const xmlDTE = generateXMLDTE(factura);
    
    // Mostrar XML en consola
    console.log("=".repeat(80));
    console.log("XML DTE GENERADO - FACTURA #" + factura.id);
    console.log("=".repeat(80));
    console.log(xmlDTE);
    console.log("=".repeat(80));

    // Actualizar estado de la factura
    await prisma.factura.update({
      where: { id: factura.id },
      data: { estado: "ENVIADA" }
    });

    return NextResponse.json({
      success: true,
      message: "Factura enviada correctamente",
      facturaId: factura.id,
      xml: xmlDTE
    });

  } catch (error) {
    console.error("Error al enviar factura:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function generateXMLDTE(factura: any): string {
  const fechaEmision = new Date(factura.fechaEmision).toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE version="1.0">
  <Documento ID="MiPE76354771-11">
    <Encabezado>
      <IdDoc>
        <TipoDTE>${factura.tipoDTE}</TipoDTE>
        <Folio>${factura.id}</Folio>
        <FchEmis>${fechaEmision}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${factura.rutEmisor}</RUTEmisor>
        <RznSoc>${factura.razonSocialEmisor}</RznSoc>
        <GiroEmis>${factura.user.giro || "Sin especificar"}</GiroEmis>
        <DirOrigen>${factura.user.direccion || "Sin especificar"}</DirOrigen>
      </Emisor>
      <Receptor>
        <RUTRecep>${factura.rutReceptor}</RUTRecep>
        <RznSocRecep>${factura.razonSocialReceptor}</RznSocRecep>
        <DirRecep>${factura.direccionReceptor}</DirRecep>
        <CmnaRecep>${factura.comunaReceptor}</CmnaRecep>
        <CiudadRecep>${factura.ciudadReceptor || ""}</CiudadRecep>
      </Receptor>
      <Totales>
        <MntNeto>${factura.montoNeto}</MntNeto>
        <TasaIVA>19</TasaIVA>
        <IVA>${factura.iva}</IVA>
        <MntTotal>${factura.montoTotal}</MntTotal>
      </Totales>
    </Encabezado>
    <Detalle>${factura.detalles.map((detalle: any, index: number) => `
      <Detalle>
        <NroLinDet>${index + 1}</NroLinDet>
        <CdgItem>
          <TpoCodigo>INT1</TpoCodigo>
          <VlrCodigo>${detalle.id}</VlrCodigo>
        </CdgItem>
        <NmbItem>${detalle.descripcion}</NmbItem>
        <QtyItem>${detalle.cantidad}</QtyItem>
        <PrcItem>${detalle.precioUnit}</PrcItem>
        <DescuentoMont>${detalle.descuento}</DescuentoMont>
        <MontoItem>${detalle.montoNeto}</MontoItem>
      </Detalle>`).join('')}
    </Detalle>
    ${factura.observaciones ? `<Observaciones>${factura.observaciones}</Observaciones>` : ''}
  </Documento>
</DTE>`;
}