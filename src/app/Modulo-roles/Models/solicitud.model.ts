export type EstadoSolicitud = 'Pendiente' | 'EnRevision' | 'Asignada' | 'Cerrada';

export const ESTADOS_SOLICITUD: { valor: EstadoSolicitud; texto: string }[] = [
  { valor: 'Pendiente', texto: 'Pendiente' },
  { valor: 'EnRevision', texto: 'En revisión' },
  { valor: 'Asignada', texto: 'Asignada' },
  { valor: 'Cerrada', texto: 'Cerrada' },
];

export interface Solicitud {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioCorreo: string | null;
  motivo: string;
  estado: EstadoSolicitud;
  psicologoAsignadoId: number | null;
  psicologoAsignadoNombre: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}
