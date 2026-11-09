export type TipoAnuncio = 'Informativo' | 'Importante';

/** Aviso de la franja superior del sitio público. */
export interface Anuncio {
  id: number;
  texto: string;
  enlace: string | null;
  tipo: TipoAnuncio;
  desde: string;
  hasta: string | null;
  activo: boolean;
  vigente: boolean;
  /** "Publicado", "Programado", "Vencido" o "Desactivado" (lo calcula el backend). */
  situacion: string;
}

export interface AnuncioGuardar {
  texto: string;
  enlace: string | null;
  tipo: TipoAnuncio;
  desde: string | null;
  hasta: string | null;
  activo: boolean;
}
