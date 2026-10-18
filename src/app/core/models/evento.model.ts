export type ModalidadEvento = 'Presencial' | 'Virtual' | 'Mixta';

export const MODALIDADES_EVENTO: ModalidadEvento[] = ['Presencial', 'Virtual', 'Mixta'];

/** Campana aparece en "Nuestras campañas" del inicio; Evento en "Próximos eventos". */
export type TipoEvento = 'Campana' | 'Evento';

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  /** Fecha y hora de inicio en UTC (ISO 8601). */
  fechaInicio: string;
  lugar: string;
  modalidad: ModalidadEvento;
  imagenUrl: string | null;
  publicado: boolean;
  tipo: TipoEvento;
}

export interface EventoGuardar {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  lugar: string;
  modalidad: ModalidadEvento;
  imagenUrl: string | null;
  publicado: boolean;
  tipo: TipoEvento;
}
