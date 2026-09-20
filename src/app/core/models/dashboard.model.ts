import { Cita } from './cita.model';

export interface Dashboard {
  usuariosActivos: number;
  psicologosActivos: number;
  citasHoy: number;
  citasProximos7Dias: number;
  solicitudesPendientes: number;
  mensajesSinLeer: number;
  eventosPublicados: number;
  correosPendientes: number;
  /** Citas de los próximos 7 días (hora de Lima), una entrada por día. */
  citasPorDia: { fecha: string; cantidad: number }[];
  proximasCitas: Cita[];
}
