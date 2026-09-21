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
