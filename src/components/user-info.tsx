"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton"; // Importa el Skeleton de shadcn

export const UserInfo = () => {
  const { data: session, status } = useSession(); // `status` indica el estado de la sesión

  // Si la sesión está cargando, muestra el Skeleton
  // Skeleton es un componente que simula la carga de un componente
  if (status === "loading") {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" /> {/* Skeleton para el nombre */}
        <Skeleton className="h-4 w-[250px]" /> {/* Skeleton para el email */}
      </div>
    );
  }

  // Si no hay sesión, muestra un mensaje
  if (!session) {
    return <p>No has iniciado sesión</p>;
  }

  // Si la sesión está cargada, muestra la información del usuario
  return (
    <div className="space-y-2">
      <p>
        <strong>Nombre:</strong> {session.user?.name}
      </p>
      <p>
        <strong>Email:</strong> {session.user?.email}
      </p>
    </div>
  );
};
