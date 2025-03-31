import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "next-auth";

// Definir el tipo del store de autenticación
type AuthState = {
  session: Session | null; // Estado de la sesión del usuario
  setSession: (session: Session | null) => void;
  logout: () => void;
};

// Crear el store de Zustand con persistencia
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null, // Estado inicial: sin sesión
      setSession: (session) => set({ session }),
      logout: () => set({ session: null }),
    }),
    {
      name: "auth-storage", // Guardar el estado en `localStorage`
    }
  )
);
