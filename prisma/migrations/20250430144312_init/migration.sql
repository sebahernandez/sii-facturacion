-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('EMITIDA', 'NO_ENVIADA', 'ENVIADA', 'ANULADA');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rutEmpresa" TEXT,
    "razonSocial" TEXT,
    "giro" TEXT,
    "direccion" TEXT,
    "certificateToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "descuento" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "montoNeto" DECIMAL(65,30) NOT NULL,
    "iva" DECIMAL(65,30) NOT NULL DEFAULT 12.00,
    "montoTotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "rut" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "giro" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "comuna" TEXT NOT NULL,
    "ciudad" TEXT,
    "contacto" TEXT,
    "telefono" TEXT,
    "user_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" SERIAL NOT NULL,
    "tipoDTE" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "razonSocialEmisor" TEXT NOT NULL,
    "rutEmisor" TEXT NOT NULL,
    "rutReceptor" TEXT NOT NULL,
    "razonSocialReceptor" TEXT NOT NULL,
    "direccionReceptor" TEXT NOT NULL,
    "comunaReceptor" TEXT NOT NULL,
    "ciudadReceptor" TEXT,
    "contactoReceptor" TEXT,
    "montoNeto" DECIMAL(10,2) NOT NULL,
    "iva" DECIMAL(10,2) NOT NULL,
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'EMITIDA',
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
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "montoNeto" DECIMAL(10,2) NOT NULL,
    "factura_id" INTEGER NOT NULL,

    CONSTRAINT "DetalleFactura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_rut_key" ON "Cliente"("rut");

-- CreateIndex
CREATE INDEX "Factura_user_id_idx" ON "Factura"("user_id");

-- CreateIndex
CREATE INDEX "DetalleFactura_factura_id_idx" ON "DetalleFactura"("factura_id");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleFactura" ADD CONSTRAINT "DetalleFactura_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
