import { create } from "zustand";
import { toast } from "sonner";
import { Cliente } from "@/types/cliente";
import { fetchClients } from "@/lib/clientServices";

// Definir la interfaz del store
interface ClienteStore {
  clientes: Cliente[] | null;
  isLoading: boolean;
  fetchClientes: (signal?: AbortSignal) => Promise<void>;
  eliminarCliente: (id: number, razonSocial: string) => Promise<boolean>;
  editarCliente: (cliente: Cliente) => Promise<boolean>;
  setClientes: (clientes: Cliente[]) => void;
  resetClientes: () => void;
}

// Implementación del store
const useClienteStore = create<ClienteStore>((set, get) => ({
  clientes: null,
  isLoading: false,

  // Función para cargar clientes
  fetchClientes: async (signal?: AbortSignal) => {
    const { clientes, isLoading } = get();
    if (clientes || isLoading) return;

    set({ isLoading: true });
    try {
      const data = await fetchClients(signal);
      set({ clientes: data });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Fetch cancelado");
      } else {
        console.error("Error al cargar clientes:", error);
        toast.error("Error al cargar los clientes");
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // Función para eliminar un cliente
  eliminarCliente: async (id: number, razonSocial: string) => {
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");

      // Actualizar clientes después de eliminar
      const { resetClientes, fetchClientes } = get();
      resetClientes();
      await fetchClientes();

      toast.success(`Cliente ${razonSocial} eliminado exitosamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar cliente");
      return false;
    }
  },

  // Función para editar un cliente
  editarCliente: async (cliente: Cliente) => {
    const { id, ...rest } = cliente;
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        body: JSON.stringify(rest),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Error al editar");

      const { resetClientes, fetchClientes } = get();
      resetClientes();
      await fetchClientes();

      toast.success(`Cliente ${cliente.razonSocial} actualizado exitosamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar cliente");
      return false;
    }
  },

  // Función para establecer clientes
  setClientes: (clientes: Cliente[]) => set({ clientes }),

  // Función para resetear clientes
  resetClientes: () => set({ clientes: null }),
}));

export default useClienteStore;
