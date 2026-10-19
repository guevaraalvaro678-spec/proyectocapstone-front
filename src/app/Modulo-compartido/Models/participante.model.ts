/** Departamentos entre los que el practicante elige (principal y secundario). */
export const DEPARTAMENTOS = [
  'Recursos Humanos',
  'Comunicaciones',
  'Proyectos Sociales',
  'Eventos',
  'Administración y Finanzas',
  'Tecnología',
];

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Bloque semanal: día 1 = lunes … 7 = domingo; horas HH:mm. */
export interface BloqueHorario {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  /** Solo en el horario de prácticas. */
  modalidad?: 'Presencial' | 'Virtual' | null;
  lugar?: string | null;
}

export type EstadoHorario = 'SinEnviar' | 'Pendiente' | 'EnRevision' | 'Aceptado';

export const ETIQUETA_HORARIO: Record<EstadoHorario, string> = {
  SinEnviar: 'Sin enviar',
  Pendiente: 'Pendiente',
  EnRevision: 'En revisión',
  Aceptado: 'Aceptado',
};

export interface VoluntarioRegistro {
  googleCredential?: string;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
}

export interface Voluntario {
  usuarioId: number;
  dni: string;
  nombre: string;
  apellidos: string;
  correo: string | null;
  telefono: string | null;
  activo: boolean;
  fechaRegistro: string;
}

export interface PracticanteRegistro extends VoluntarioRegistro {
  universidad: string;
  carrera: string;
  ciclo: string;
  departamentoPrincipal: string;
  departamentoSecundario: string;
  password: string;
}

export interface Practicante {
  usuarioId: number;
  dni: string;
  nombre: string;
  apellidos: string;
  correo: string | null;
  telefono: string | null;
  universidad: string;
  carrera: string;
  ciclo: string;
  departamentoPrincipal: string;
  departamentoSecundario: string;
  estadoHorario: EstadoHorario;
  notaHorario: string | null;
  horarioConfirmado: boolean;
  fechaEnvioHorario: string | null;
  activo: boolean;
  fechaRegistro: string;
  horarioUniversidad: BloqueHorario[];
  horarioPracticas: BloqueHorario[];
}

export interface HorarioRevision {
  estado: 'EnRevision' | 'Aceptado';
  nota?: string;
  horarioPracticas?: BloqueHorario[];
}

export interface Tarea {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioRol: string;
  titulo: string;
  descripcion: string | null;
  fechaLimite: string | null;
  urgente: boolean;
  estado: 'Pendiente' | 'Completada';
  fechaCreacion: string;
}

export interface TareaCrear {
  usuarioId: number;
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  urgente: boolean;
}

export interface Marcacion {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  entrada: string;
  salida: string | null;
}
