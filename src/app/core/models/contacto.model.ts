export interface ContactoCrear {
  nombre: string;
  correo: string;
  mensaje: string;
}

export interface Contacto extends ContactoCrear {
  id: number;
  fechaEnvio: string;
  leido: boolean;
}
