import { Cita } from './cita.model';
import { Disponibilidad } from './disponibilidad.model';
import { Solicitud } from './solicitud.model';

export interface PsicologoLista {
  id: number;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  especialidad: string | null;
  numeroColegiatura: string | null;
  activo: boolean;
  ultimoAcceso: string | null;
  citasProximas: number;
  solicitudesAsignadas: number;
}

export interface PsicologoDetalle extends PsicologoLista {
  fechaRegistro: string;
  citas: Cita[];
  solicitudes: Solicitud[];
  disponibilidad: Disponibilidad[];
}

export interface PsicologoCrear {
  nombre: string;
  correo: string;
  password: string;
  telefono: string | null;
  especialidad: string;
  numeroColegiatura: string | null;
}

export type PsicologoActualizar = Omit<PsicologoCrear, 'correo' | 'password'>;
