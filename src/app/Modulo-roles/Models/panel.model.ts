import { SesionEntrevista } from '../../Modulo-compartido/Models/postulacion.model';

/** Algo que espera una acción del equipo (postulación, horario o actividad). */
export interface PendienteBandeja {
  id: number;
  titulo: string;
  detalle: string;
  fecha: string;
  diasEspera: number;
  atrasado: boolean;
}

/** Bandeja de trabajo de Recursos Humanos (GET api/dashboard/bandeja). */
export interface BandejaRrhh {
  porRevisar: number;
  porAgendar: number;
  porDecidir: number;
  atrasadas: number;
  diasLimiteRespuesta: number;
  sesionesPorCerrar: number;
  horariosPorRevisar: number;
  tareasVencidas: number;
  enTurnoAhora: number;
  postulaciones: PendienteBandeja[];
  sesiones: SesionEntrevista[];
  horarios: PendienteBandeja[];
  tareas: PendienteBandeja[];
}

/** Indicadores del proceso que calcula el procedimiento almacenado sp_IndicadoresProceso. */
export interface IndicadoresProceso {
  totalPostulaciones: number;
  decididas: number;
  aceptadas: number;
  tasaAceptacion: number | null;
  promedioDiasDecision: number | null;
  porcentajeRespuestaATiempo: number | null;
  promedioDiasHorario: number | null;
  porcentajeRegistrosCompletos: number | null;
  porcentajeCvIdentificables: number | null;
}

export interface AlertaSeguridad {
  id: number;
  tipo: string;
  titulo: string;
  detalle: string;
  cuenta: string | null;
  fecha: string;
  revisada: boolean;
}

export interface AlertasResumen {
  pendientes: number;
  alertas: AlertaSeguridad[];
}

export interface Respaldo {
  nombre: string;
  fecha: string;
  tamanoBytes: number;
}

export interface RespaldoEstado {
  enAzure: boolean;
  carpeta: string | null;
  horasEntreCopias: number;
  copiasAConservar: number;
  proximaCopia: string | null;
  copias: Respaldo[];
}
