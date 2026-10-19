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

/** Áreas a las que se puede postular. */
export const AREAS = [
  'Educación y Desarrollo Comunitario',
  'Gestión Social',
  'Comunicaciones',
  'Proyectos Sociales',
  'Eventos',
  'Recursos Humanos',
  'Administración y Finanzas',
  'Tecnología',
];

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
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  direccion: string;
  distrito: string;
  provincia: string;
  telefono: string;
  universidad: string | null;
  carrera: string | null;
  ciclo: string | null;
  departamento: string;
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
}

export interface HistorialPostulacion {
  estado: EstadoPostulacion;
  nota: string | null;
  responsable: string | null;
  fecha: string;
}

export interface PostulacionCrear {
  tipo: TipoPostulacion;
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  direccion: string;
  distrito: string;
  provincia: string;
  telefono: string;
  universidad?: string;
  carrera?: string;
  ciclo?: string;
  departamento: string;
  departamentoSecundario?: string;
  cvArchivoId: number;
  participaIniciativa: boolean;
  iniciativaDescripcion?: string;
}

export interface PostulacionEstado {
  estado: EstadoPostulacion;
  sesionEntrevistaId?: number | null;
  notaEvaluacion?: string;
}

export interface ArchivoSubido {
  id: number;
  nombre: string;
}
