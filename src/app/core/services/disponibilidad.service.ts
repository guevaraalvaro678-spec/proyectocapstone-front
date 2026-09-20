import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Disponibilidad, DisponibilidadGuardar } from '../models/disponibilidad.model';

/** Los bloques de horario que cada psicólogo deja disponibles para reservas. */
@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly http = inject(HttpClient);

  listarMia(): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${API_URL}/disponibilidad/mia`);
  }

  crear(datos: DisponibilidadGuardar): Observable<Disponibilidad> {
    return this.http.post<Disponibilidad>(`${API_URL}/disponibilidad`, datos);
  }

  actualizar(id: number, datos: DisponibilidadGuardar): Observable<Disponibilidad> {
    return this.http.put<Disponibilidad>(`${API_URL}/disponibilidad/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/disponibilidad/${id}`);
  }
}
