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
  // Indicadores que ya vienen calculados del backend.
  embudo: EtapaEmbudo[];
  pendientesAtencion: number;
  enEvaluacion: number;
  miembros: number;
  porcentajeVoluntarios: number;
  resumenDonaciones: {
    total: number;
    pendientes: number;
    recibidas: number;
    desestimadas: number;
    porcentajePendientes: number;
    porcentajeRecibidas: number;
    porcentajeDesestimadas: number;
  };
}

export interface EtapaEmbudo {
  etiqueta: string;
  valor: number;
  porcentaje: number;
  alerta: boolean;
}
