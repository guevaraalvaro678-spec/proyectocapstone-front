import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_URL, urlServidor } from '../../config/api.config';
import { Donacion, DonacionCrear, DonacionResumen, EstadoDonacion, Noticia, NoticiaGuardar } from '../Models/donacion.model';

const conUrl = (n: Noticia): Noticia => ({ ...n, imagenUrl: urlServidor(n.imagenUrl) });

/** Donaciones de artículos (registro público) y noticias del sitio. */
@Injectable({ providedIn: 'root' })
export class DonacionService {
  private readonly http = inject(HttpClient);

  // ---- Donaciones ----

  registrar(datos: DonacionCrear): Observable<Donacion> {
    return this.http.post<Donacion>(`${API_URL}/donacion`, datos);
  }

  listar(estado = '', buscar = ''): Observable<Donacion[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (buscar) params = params.set('buscar', buscar);
    return this.http.get<Donacion[]>(`${API_URL}/donacion`, { params });
  }

  cambiarEstado(id: number, estado: EstadoDonacion, observaciones: string): Observable<Donacion> {
    return this.http.put<Donacion>(`${API_URL}/donacion/${id}/estado`, { estado, observaciones });
  }

  guardarObservaciones(id: number, observaciones: string): Observable<Donacion> {
    return this.http.put<Donacion>(`${API_URL}/donacion/${id}/observaciones`, { observaciones });
  }

  /** Totales por estado e inventario de lo recibido (calculados en el backend). */
  resumen(): Observable<DonacionResumen> {
    return this.http.get<DonacionResumen>(`${API_URL}/donacion/resumen`);
  }

  // ---- Noticias ----

  noticiasPublicas(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(`${API_URL}/noticia/publicas`).pipe(map((l) => l.map(conUrl)));
  }

  listarNoticias(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(`${API_URL}/noticia`).pipe(map((l) => l.map(conUrl)));
  }

  crearNoticia(datos: NoticiaGuardar): Observable<Noticia> {
    return this.http.post<Noticia>(`${API_URL}/noticia`, datos);
  }

  actualizarNoticia(id: number, datos: NoticiaGuardar): Observable<Noticia> {
    return this.http.put<Noticia>(`${API_URL}/noticia/${id}`, datos);
  }

  eliminarNoticia(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/noticia/${id}`);
  }
}
