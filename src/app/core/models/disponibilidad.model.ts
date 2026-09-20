import { ModalidadCita } from './cita.model';

export type ModalidadHorario = ModalidadCita | 'Mixta';

/** Días de la semana como los numera el backend: 0 = domingo ... 6 = sábado. */
export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Orden en que se muestran: la semana empieza el lunes. */
export const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];

export interface Disponibilidad {
  id: number;
  psicologoId: number;
  diaSemana: number;
  /** HH:mm, hora de Lima. */
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  modalidad: ModalidadHorario;
  lugar: string | null;
  activo: boolean;
}

export type DisponibilidadGuardar = Omit<Disponibilidad, 'id' | 'psicologoId'>;

/** Un horario concreto que un paciente puede reservar. */
export interface HorarioDisponible {
  /** Inicio en UTC (ISO 8601). */
  inicio: string;
  duracionMinutos: number;
  modalidad: ModalidadHorario;
  lugar: string | null;
}

export interface PsicologoPublico {
  id: number;
  nombre: string;
  especialidad: string | null;
}

export interface ReservaCrear {
  psicologoId: number;
  fechaInicio: string;
  modalidad: ModalidadCita;
  motivo: string;
}
