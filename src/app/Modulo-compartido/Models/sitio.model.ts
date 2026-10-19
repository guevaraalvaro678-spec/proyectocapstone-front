export type ColorIniciativa = 'rojo' | 'verde' | 'naranja' | 'gris';

export const COLORES_INICIATIVA: ColorIniciativa[] = ['rojo', 'verde', 'naranja', 'gris'];

export interface Iniciativa {
  id: number;
  titulo: string;
  texto: string;
  icono: string;
  color: ColorIniciativa;
  imagenId: number | null;
  imagenUrl: string | null;
  orden: number;
  activa: boolean;
  /** Las que proponen voluntarios o practicantes empiezan pendientes de revisión. */
  estado: EstadoIniciativa;
  motivoRechazo: string | null;
  creadaPorNombre: string | null;
  creadaPorRol: string | null;
  fechaCreacion: string;
}

export type EstadoIniciativa = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface IniciativaPropuesta {
  titulo: string;
  texto: string;
}

export interface IniciativaGuardar {
  titulo: string;
  texto: string;
  icono: string;
  color: ColorIniciativa;
  imagenId: number | null;
  orden: number;
  activa: boolean;
}

export interface SitioPublico {
  logoUrl: string | null;
  iniciativas: Iniciativa[];
  /** Null si la ONG no configuró Yape. */
  yape: Yape | null;
}

/** Datos para donar dinero con Yape (la plataforma no procesa pagos, solo los muestra). */
export interface Yape {
  numero: string | null;
  /** Con espacios para leerlo fácil: 987 654 321. */
  numeroVisible: string | null;
  titular: string | null;
  qrImagenId: number | null;
  qrUrl: string | null;
}

export interface YapeGuardar {
  numero: string | null;
  titular: string | null;
  qrImagenId: number | null;
}

export interface ImagenSubida {
  id: number;
  url: string;
}
