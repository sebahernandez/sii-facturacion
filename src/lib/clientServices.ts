import { Cliente } from "@/types/cliente";

// Esta función se encarga de agregar un nuevo cliente.
// Se realiza una solicitud POST a la API con los datos del nuevo cliente.
// Si la solicitud es exitosa, se devuelve true. En caso de error, se lanza una excepción.
export const agregarCliente = async (cliente: Cliente): Promise<boolean> => {
  const res = await fetch("/api/clientes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cliente),
  });

  if (!res.ok) throw new Error("Error al agregar cliente");

  return true;
};

// obtener los clientes desde la API
// Esta función se encarga de realizar una solicitud a la API para obtener la lista de clientes.
// Se puede utilizar un AbortSignal para cancelar la solicitud si es necesario.
// La función devuelve una promesa que se resuelve con la lista de clientes o lanza un error si la solicitud falla.
export const fetchClients = async (
  signal?: AbortSignal
): Promise<Cliente[]> => {
  const response = await fetch("/api/clientes", { signal });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};

// Esta función se encarga de editar un cliente específico.
// Se realiza una solicitud PUT a la API con el ID del cliente y los datos actualizados.
// Si la solicitud es exitosa, se devuelve true. En caso de error, se lanza una excepción.
export const updateClient = async (cliente: Cliente): Promise<boolean> => {
  const { id, ...rest } = cliente;
  const res = await fetch(`/api/clientes?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });

  if (!res.ok) throw new Error("Error al editar");

  return true;
};

// Esta función se encarga de eliminar un cliente específico.
// Se realiza una solicitud DELETE a la API con el ID del cliente.
// Si la solicitud es exitosa, se devuelve true. En caso de error, se lanza una excepción.
export const deleteClient = async (id: number): Promise<boolean> => {
  const res = await fetch(`/api/clientes?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar");

  return true;
};
