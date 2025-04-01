import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login", // Ruta de inicio de sesión
  },
});

export const config = {
  matcher: ["/dashboard/:path*"], // Protege todas las rutas dentro de /dashboard
};
