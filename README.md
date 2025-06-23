This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Conectar certificado digital para el SII

1. Inicie sesión y diríjase a **Configuración** (`/dashboard/configuracion`).
2. En la sección *Certificado Digital* suba su archivo `.pfx` o `.pem` e introduzca la contraseña.
3. Presione **Verificar y guardar certificado** para almacenar de forma segura el token del certificado.
4. Solicite una semilla al SII con `GET /api/sii/semilla` (requiere autenticación).
5. Luego obtenga el token definitivo mediante `POST /api/sii/token` enviando `{ "password": "<contraseña del certificado>", "ambiente": "certificacion" }`.
6. Con el token activo la aplicación puede firmar y enviar facturas electrónicas al SII.
7. Consulte la información del certificado con `GET /api/certificado` para verificar que quedó almacenado correctamente.
8. Si necesita desvincular el certificado, envíe `DELETE /api/certificado` y repita el proceso con un nuevo archivo.


## Factura de prueba en el ambiente de certificación

1. Con el token obtenido, envíe una solicitud `POST /api/sii/factura-prueba` con `{ "password": "<contraseña del certificado>", "ambiente": "certificacion" }`.
2. El endpoint genera un DTE de ejemplo y lo envía a `https://maullin.sii.cl/cgi_dte/UPL/DTEUpload` usando su certificado digital.
3. Revise la respuesta para confirmar que la conexión con el SII se realizó correctamente.

