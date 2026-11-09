import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../config/api.config';
import { Anuncio, AnuncioGuardar } from '../Models/anuncio.model';

/** Anuncios del sitio: los vigentes para el público y la gestión desde el panel. */
@Injectable({ providedIn: 'root' })
export class AnuncioService {
  private readonly http = inject(HttpClient);

  vigentes(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${API_URL}/anuncio/vigentes`);
  }

  listar(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${API_URL}/anuncio`);
  }

  crear(datos: AnuncioGuardar): Observable<Anuncio> {
    return this.http.post<Anuncio>(`${API_URL}/anuncio`, datos);
  }

  actualizar(id: number, datos: AnuncioGuardar): Observable<Anuncio> {
    return this.http.put<Anuncio>(`${API_URL}/anuncio/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/anuncio/${id}`);
  }
}
