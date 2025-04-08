export interface Cliente {
  id: number;
  rut: string;
  razonSocial: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad?: string;
  contacto?: string;
  telefono?: string;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
}
