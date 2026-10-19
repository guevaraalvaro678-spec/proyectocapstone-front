export type Rol = 'SuperAdmin' | 'Admin' | 'RRHH' | 'Voluntario' | 'Practicante' | 'Postulante';

export type RolAdmin = 'SuperAdmin' | 'Admin';

export interface LoginRequest {
  usuario: string;
  password: string;
}

/** Datos para que un SuperAdmin cree otro administrador. */
export interface RegistroRequest {
  usuario: string;
  password: string;
  rol: RolAdmin;
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
}

export interface UsuarioCreado {
  id: number;
  usuario: string;
  rol: Rol;
}
