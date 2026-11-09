export type Rol = 'SuperAdmin' | 'Admin' | 'RRHH' | 'Voluntario' | 'Practicante' | 'Postulante';

export type RolAdmin = 'SuperAdmin' | 'Admin';

export interface LoginRequest {
  usuario: string;
  password: string;
}

/** Perfiles del equipo de gestión que puede crear un SuperAdmin. */
export type RolGestion = RolAdmin | 'RRHH';

/** Datos para que un SuperAdmin cree una cuenta del equipo (el correo es también el usuario). */
export interface RegistroRequest {
  nombre: string;
  correo: string;
  password: string;
  rol: RolGestion;
}

export interface Sesion {
  id: number;
  usuario: string;
  nombre: string;
  rol: Rol;
  token: string;
}

/** Respuesta del primer paso del login: la sesión, o un desafío para pedir el código de verificación. */
export interface LoginResultado {
  sesion: Sesion | null;
  requiereVerificacion: boolean;
  desafio: string | null;
  canales: CanalVerificacion[];
}

export interface CanalVerificacion {
  canal: 'correo' | 'sms';
  /** Oculto: al***@gmail.com o *** *** 321. */
  destino: string;
}

export interface CodigoEnviado {
  destino: string;
  expiraEnSegundos: number;
  /** Cuánto esperar para poder reenviar (lo decide el backend). */
  reenviarEnSegundos: number;
}

export interface UsuarioCreado {
  id: number;
  usuario: string;
  rol: Rol;
}
