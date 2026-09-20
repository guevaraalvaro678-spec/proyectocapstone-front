export interface UsuarioPerfil {
  id: number;
  nombre: string;
  correo: string | null;
  ubicacion: string | null;
  intereses: string | null;
  recordatoriosCorreo: boolean;
  preferenciaVirtual: boolean;
  fechaRegistro: string;
}

export interface UsuarioPerfilActualizar {
  nombre: string;
  ubicacion: string | null;
  intereses: string | null;
  recordatoriosCorreo: boolean;
  preferenciaVirtual: boolean;
}
