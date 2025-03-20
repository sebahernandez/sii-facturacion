"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session } = useSession();

  useEffect(() => {
    console.log("Usuario autenticado:", session?.user);
  }, [session]);

  return (
    <div className="container mx-auto mt-10">
      <h1>Dashboard</h1>
      {session ? (
        <div>
          <p>Bienvenido, {session.user?.name}!</p>
          <button
            onClick={() => signOut()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <p>No has iniciado sesión</p>
      )}
    </div>
  );
}
