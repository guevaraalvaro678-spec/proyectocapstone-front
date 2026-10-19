import { Sesion } from './auth.model';

export type TipoPostulacion = 'Voluntario' | 'Practicante';

export type EstadoPostulacion =
  | 'Recibida'
  | 'HabilitadaEntrevista'
  | 'EntrevistaAgendada'
  | 'EntrevistaRealizada'
  | 'EnCalificacion'
  | 'Aceptada'
  | 'NoAdmitida';

export const ESTADOS_POSTULACION: EstadoPostulacion[] = [
  'Recibida',
  'HabilitadaEntrevista',
  'EntrevistaAgendada',
  'EntrevistaRealizada',
  'EnCalificacion',
  'Aceptada',
  'NoAdmitida',
];

export const ETIQUETA_POSTULACION: Record<EstadoPostulacion, string> = {
  Recibida: 'Recibida',
  HabilitadaEntrevista: 'Habilitada para entrevista',
  EntrevistaAgendada: 'Entrevista agendada',
  EntrevistaRealizada: 'Entrevista realizada',
  EnCalificacion: 'En proceso de calificación',
  Aceptada: 'Aceptada',
  NoAdmitida: 'No admitida',
};

/** Color de la etiqueta de cada estado (clases ui-etiqueta--*). */
export const COLOR_POSTULACION: Record<EstadoPostulacion, string> = {
  Recibida: 'naranja',
  HabilitadaEntrevista: 'naranja',
  EntrevistaAgendada: 'verde',
  EntrevistaRealizada: 'verde',
  EnCalificacion: 'azul',
  Aceptada: 'verde',
  NoAdmitida: 'gris',
};

export interface SesionEntrevista {
  id: number;
  codigo: string;
  nombre: string;
  /** UTC (ISO 8601). */
  inicio: string;
  fin: string;
  modalidad: 'Presencial' | 'Virtual';
  lugarOEnlace: string;
  cupo: number;
  inscritos: number;
  estado: 'Programada' | 'Realizada' | 'Cancelada';
  /** Lo decide el backend: programada, sin terminar y con cupos. */
  disponible: boolean;
  porcentajeOcupacion: number;
}

export interface SesionEntrevistaDetalle extends SesionEntrevista {
  postulantes: Postulacion[];
}

export interface SesionEntrevistaGuardar {
  nombre: string;
  inicio: string;
  fin: string;
  modalidad: 'Presencial' | 'Virtual';
  lugarOEnlace: string;
  cupo: number;
}

export interface Postulacion {
  id: number;
  codigo: string;
  usuarioId: number;
  correo: string;
  tipo: TipoPostulacion;
  /** DNI, nacimiento, dirección y área: null en las postulaciones de voluntario. */
  dni: string | null;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string | null;
  direccion: string | null;
  distrito: string | null;
  provincia: string | null;
  telefono: string;
  universidad: string | null;
  carrera: string | null;
  ciclo: string | null;
  departamento: string | null;
  departamentoSecundario: string | null;
  cvArchivoId: number | null;
  cvNombre: string | null;
  participaIniciativa: boolean;
  iniciativaDescripcion: string | null;
  estado: EstadoPostulacion;
  notaEvaluacion: string | null;
  fechaEnvio: string;
  fechaActualizacion: string;
  sesion: SesionEntrevista | null;
  /** Solo llega en el detalle de una postulación. */
  historial?: HistorialPostulacion[] | null;
  /** Estados a los que puede pasar ahora; los define el backend. */
  acciones: EstadoPostulacion[];
}

/** Indicadores de la lista con los filtros aplicados (GET api/postulacion/resumen). */
export interface PostulacionResumen {
  total: number;
  recibidas: number;
  habilitadas: number;
  agendadas: number;
  enProceso: number;
  aceptadas: number;
  noAdmitidas: number;
  requierenAtencion: number;
}

/** Respuesta del envío completo del formulario. */
export interface PostulacionEnviada {
  sesion: Sesion | null;
  esMiembro: boolean;
  postulacion: Postulacion | null;
}

export interface HistorialPostulacion {
  estado: EstadoPostulacion;
  nota: string | null;
  responsable: string | null;
  fecha: string;
}

/** El voluntario solo envía nombres, apellidos y teléfono; el resto es del practicante. */
export interface PostulacionCrear {
  tipo: TipoPostulacion;
  nombres: string;
  apellidos: string;
  telefono: string;
  dni?: string;
  fechaNacimiento?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  universidad?: string;
  carrera?: string;
  ciclo?: string;
  departamento?: string;
  departamentoSecundario?: string;
  participaIniciativa?: boolean;
  iniciativaDescripcion?: string;
}

export interface PostulacionEstado {
  estado: EstadoPostulacion;
  sesionEntrevistaId?: number | null;
  notaEvaluacion?: string;
}
