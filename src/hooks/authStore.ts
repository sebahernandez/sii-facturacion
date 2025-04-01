import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "next-auth";
import { getSession } from "next-auth/react";

// Definir el tipo del store de autenticación
type AuthState = {
  session: Session | null; // Estado de la sesión del usuario, null indica que no hay session activa
  setSession: (session: Session | null) => void; // Establecer la sesión del usuario
  logout: () => void; // Cerrar sesión
};

// Crear el store de Zustand con persistencia
export const useAuthStore = create<AuthState>()(
  persist(
    // set es una funcion de zustand para actualizar el estado del store
    (set) => ({
      session: null, // Estado inicial: sin sesión
      setSession: (session) => set({ session }), // Establecer la sesión del usuario
      logout: () => set({ session: null }), // Cerrar sesión
    }),
    {
      name: "auth-storage", // Guardar el estado en `localStorage`
      partialize: (state) => ({ session: state.session }), // Persistir solo la sesión
    }
  )
);

export const initializeAuthStore = async () => {
  const session = await getSession();
  useAuthStore.getState().setSession(session);
};
