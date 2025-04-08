-- CreateTable
CREATE TABLE "Factura" (
    "id" SERIAL NOT NULL,
    "folio" INTEGER NOT NULL,
    "tipoDTE" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "razonSocialEmisor" TEXT NOT NULL,
    "rutEmisor" TEXT NOT NULL,
    "rutReceptor" TEXT NOT NULL,
    "razonSocialReceptor" TEXT NOT NULL,
    "direccionReceptor" TEXT NOT NULL,
    "comunaReceptor" TEXT NOT NULL,
    "ciudadReceptor" TEXT,
    "montoNeto" DECIMAL(10,2) NOT NULL,
    "iva" DECIMAL(10,2) NOT NULL,
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'emitida',
    "observaciones" TEXT,
    "user_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleFactura" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioUnit" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "montoNeto" DECIMAL(10,2) NOT NULL,
    "factura_id" INTEGER NOT NULL,

    CONSTRAINT "DetalleFactura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Factura_folio_key" ON "Factura"("folio");

-- CreateIndex
CREATE INDEX "Factura_user_id_idx" ON "Factura"("user_id");

-- CreateIndex
CREATE INDEX "DetalleFactura_factura_id_idx" ON "DetalleFactura"("factura_id");

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleFactura" ADD CONSTRAINT "DetalleFactura_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
