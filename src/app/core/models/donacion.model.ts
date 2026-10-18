export type CategoriaDonacion = 'MaterialEducativo' | 'RopaAbrigo' | 'Juguetes' | 'Alimentos' | 'Higiene' | 'Otros';

export const CATEGORIAS_DONACION: { valor: CategoriaDonacion; etiqueta: string; icono: string }[] = [
  { valor: 'MaterialEducativo', etiqueta: 'Material educativo', icono: 'menu_book' },
  { valor: 'RopaAbrigo', etiqueta: 'Ropa y abrigo', icono: 'checkroom' },
  { valor: 'Juguetes', etiqueta: 'Juguetes', icono: 'toys' },
  { valor: 'Alimentos', etiqueta: 'Alimentos', icono: 'nutrition' },
  { valor: 'Higiene', etiqueta: 'Artículos de higiene', icono: 'sanitizer' },
  { valor: 'Otros', etiqueta: 'Otros', icono: 'inventory_2' },
];

export type EstadoDonacion = 'PendienteRecepcion' | 'Recibida' | 'Desestimada';

export const ETIQUETA_DONACION: Record<EstadoDonacion, string> = {
  PendienteRecepcion: 'Pendiente de recepción',
  Recibida: 'Recibida',
  Desestimada: 'Desestimada',
};

export interface DonacionArticulo {
  categoria: CategoriaDonacion;
  nombre: string;
  cantidad: number;
}

export interface Donacion {
  id: number;
  codigo: string;
  donanteNombre: string;
  telefono: string;
  estado: EstadoDonacion;
  observaciones: string | null;
  fechaRegistro: string;
  articulos: DonacionArticulo[];
}

export interface DonacionCrear {
  donanteNombre: string;
  telefono: string;
  articulos: DonacionArticulo[];
}

export type EstadoNoticia = 'Borrador' | 'Publicada' | 'NoPublicada';

export const ETIQUETA_NOTICIA: Record<EstadoNoticia, string> = {
  Borrador: 'Borrador',
  Publicada: 'Publicada',
  NoPublicada: 'No publicada',
};

export interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string | null;
  imagenId: number | null;
  imagenUrl: string | null;
  estado: EstadoNoticia;
  fecha: string;
}

export interface NoticiaGuardar {
  titulo: string;
  resumen: string;
  contenido: string | null;
  imagenId: number | null;
  estado: EstadoNoticia;
  fecha: string | null;
}
