import { Cita } from './cita.model';
import { Rol } from './auth.model';
import { Solicitud } from './solicitud.model';

export interface UsuarioLista {
  id: number;
  nombre: string;
  correo: string | null;
  nombreUsuario: string;
  telefono: string | null;
  rol: Rol;
  activo: boolean;
  fechaRegistro: string;
  ultimoAcceso: string | null;
}

export interface UsuarioDetalle extends UsuarioLista {
  ubicacion: string | null;
  intereses: string | null;
  recordatoriosCorreo: boolean;
  preferenciaVirtual: boolean;
  solicitudes: Solicitud[];
  citas: Cita[];
}

export type TipoUsuario = 'Usuario' | 'Administrador';
