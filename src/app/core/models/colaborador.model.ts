export type EstadoColaborador = 'Pendiente' | 'Aprobado' | 'Rechazado';

export interface Colaborador {
  id: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  especialidad: string;
  numeroColegiatura: string | null;
  presentacion: string | null;
  estado: EstadoColaborador;
  motivoRechazo: string | null;
  fechaSolicitud: string;
  fechaRevision: string | null;
  usuarioId: number | null;
}

export interface ColaboradorPostulacion {
  nombre: string;
  correo: string;
  password: string;
  telefono?: string;
  especialidad: string;
  numeroColegiatura?: string;
  presentacion?: string;
}
