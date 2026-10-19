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
}

export interface ImagenSubida {
  id: number;
  url: string;
}
