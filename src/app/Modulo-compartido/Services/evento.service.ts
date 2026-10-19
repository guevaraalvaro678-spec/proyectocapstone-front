import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../config/api.config';
import { Evento, EventoGuardar } from '../Models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventoService {
  private readonly http = inject(HttpClient);

  /** Público: los próximos eventos publicados, para el banner del sitio. */
  listarPublicos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${API_URL}/evento`);
  }

  /** Administrador: todos los eventos, publicados o no. */
  listarTodos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${API_URL}/evento/todos`);
  }

  crear(datos: EventoGuardar): Observable<Evento> {
    return this.http.post<Evento>(`${API_URL}/evento`, datos);
  }

  actualizar(id: number, datos: EventoGuardar): Observable<Evento> {
    return this.http.put<Evento>(`${API_URL}/evento/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/evento/${id}`);
  }
}
