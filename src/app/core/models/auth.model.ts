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

export interface UsuarioCreado {
  id: number;
  usuario: string;
  rol: Rol;
}
