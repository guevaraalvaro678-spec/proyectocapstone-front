export type EstadoCorreo = 'Pendiente' | 'Enviando' | 'Enviado' | 'Fallido';
export type AudienciaCorreo = 'Usuarios' | 'Psicologos' | 'Postulantes' | 'Administradores' | 'Todos' | 'Individual';

export interface Correo {
  id: number;
  destinatario: string;
  nombreDestinatario: string | null;
  asunto: string;
  tipo: string;
  estado: EstadoCorreo;
  error: string | null;
  lote: string | null;
  fechaCreacion: string;
  fechaEnvio: string | null;
}

export interface CorreoEnviar {
  audiencia: AudienciaCorreo;
  correo?: string | null;
  asunto: string;
  mensaje: string;
  incluirSinPreferencia: boolean;
}

export interface CorreoEnvioResultado {
  destinatarios: number;
  lote: string;
}

export interface CorreoEstado {
  /** False si el servidor no tiene SMTP configurado: los correos se guardan pero no salen. */
  smtpConfigurado: boolean;
  pendientes: number;
}

