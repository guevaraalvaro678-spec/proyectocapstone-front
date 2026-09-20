export type Rol = 'SuperAdmin' | 'Admin' | 'Psicologo' | 'Usuario';

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

/** Datos con los que una persona se registra como usuario común. */
export interface RegistroUsuarioRequest {
  nombre: string;
  correo: string;
  password: string;
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
