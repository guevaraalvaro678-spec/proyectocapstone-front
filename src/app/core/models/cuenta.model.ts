import { EstadoPostulacion, SesionEntrevista } from './postulacion.model';

/** Datos de la cuenta que inició sesión ("Mi cuenta y seguridad"). */
export interface Cuenta {
  id: number;
  usuario: string;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  rol: string;
  activo: boolean;
  dni: string | null;
  fechaRegistro: string;
}

export interface CuentaPerfil {
  nombre: string;
  telefono: string | null;
}

export interface DashboardOng {
  postulaciones: Record<EstadoPostulacion, number>;
  totalPostulaciones: number;
  voluntarios: number;
  practicantes: number;
  personalAdministrativo: number;
  donaciones: Partial<Record<'PendienteRecepcion' | 'Recibida' | 'Desestimada', number>>;
  iniciativasPendientes: number;
  horariosPendientes: number;
  proximasSesiones: SesionEntrevista[];
}
