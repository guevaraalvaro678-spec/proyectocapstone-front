export type Rol = 'SuperAdmin' | 'Admin';

export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface RegistroRequest {
  usuario: string;
  password: string;
  rol: Rol;
}

export interface Sesion {
  id: number;
  usuario: string;
  rol: Rol;
  token: string;
}

export interface UsuarioCreado {
  id: number;
  usuario: string;
  rol: Rol;
}
