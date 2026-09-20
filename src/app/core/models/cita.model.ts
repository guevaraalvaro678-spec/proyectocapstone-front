export type EstadoCita = 'Programada' | 'Confirmada' | 'Realizada' | 'Cancelada';
export type ModalidadCita = 'Presencial' | 'Virtual';

export const ESTADOS_CITA: EstadoCita[] = ['Programada', 'Confirmada', 'Realizada', 'Cancelada'];

export interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  pacienteCorreo: string | null;
  psicologoId: number;
  psicologoNombre: string;
  /** Inicio en UTC (ISO 8601). */
  fechaInicio: string;
  duracionMinutos: number;
  modalidad: ModalidadCita;
  lugar: string | null;
  motivo: string;
  estado: EstadoCita;
  /** Notas del psicólogo: el paciente nunca las recibe. */
  notas: string | null;
  fechaCreacion: string;
}

export interface CitaCrear {
  pacienteId: number;
  psicologoId: number;
  fechaInicio: string;
  duracionMinutos: number;
  modalidad: ModalidadCita;
  lugar: string | null;
  motivo: string;
}

export interface CitaFiltro {
  estado?: EstadoCita | '';
  psicologoId?: number | null;
  pacienteId?: number | null;
  desde?: string;
  hasta?: string;
}

export interface CitaEstadoCambio {
  estado: EstadoCita;
  notas?: string | null;
}
