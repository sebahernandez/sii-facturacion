import { create } from "zustand";
import { toast } from "sonner";
import { Cliente } from "@/types/cliente";
import { fetchClients, deleteClient, updateClient } from "@/lib/clientServices";

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
      await deleteClient(id);

      const { clientes } = get();
      if (!clientes) return false;
      const clientesActualizados = clientes.filter(
        (cliente) => cliente.id !== id
      );
      set({ clientes: clientesActualizados });

      toast.success(`Cliente ${razonSocial} eliminado exitosamente`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar cliente");
      return false;
    }
  },

  // Función para editar un cliente
  editarCliente: async (clienteActualizado: Cliente) => {
    try {
      await updateClient(clienteActualizado);

      const { clientes } = get();

      console.log("Clientes antes de la actualización:", clientes);

      if (!clientes) return false;

      const clientesActualizados = clientes?.map((cliente) =>
        cliente.id === clienteActualizado.id ? clienteActualizado : cliente
      );

      set({ clientes: clientesActualizados });

      toast.success(
        `Cliente ${clienteActualizado.razonSocial} actualizado exitosamente`
      );
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
  resetClientes: () => {
    console.log("Reseteando clientes...");
    set({ clientes: null });
  },
}));

export default useClienteStore;
