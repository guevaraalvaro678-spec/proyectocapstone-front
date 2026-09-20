import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Cita, CitaCrear, CitaEstadoCambio, CitaFiltro } from '../models/cita.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly http = inject(HttpClient);

  /** Administrador: todas las citas, con filtros opcionales. */
  listar(filtro: CitaFiltro = {}): Observable<Cita[]> {
    let params = new HttpParams();

    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.psicologoId) params = params.set('psicologoId', filtro.psicologoId);
    if (filtro.pacienteId) params = params.set('pacienteId', filtro.pacienteId);
    if (filtro.desde) params = params.set('desde', filtro.desde);
    if (filtro.hasta) params = params.set('hasta', filtro.hasta);

    return this.http.get<Cita[]>(`${API_URL}/cita`, { params });
  }

  /** Usuario: sus citas como paciente. Psicólogo: sus citas como profesional. */
  listarMias(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${API_URL}/cita/mias`);
  }

  crear(datos: CitaCrear): Observable<Cita> {
    return this.http.post<Cita>(`${API_URL}/cita`, datos);
  }

  actualizar(id: number, datos: CitaCrear): Observable<Cita> {
    return this.http.put<Cita>(`${API_URL}/cita/${id}`, datos);
  }

  /** Lo que se permite depende del rol: el backend lo valida. */
  cambiarEstado(id: number, cambio: CitaEstadoCambio): Observable<Cita> {
    return this.http.put<Cita>(`${API_URL}/cita/${id}/estado`, cambio);
  }
}
