import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { PsicologoActualizar, PsicologoCrear, PsicologoDetalle, PsicologoLista } from '../models/psicologo.model';

@Injectable({ providedIn: 'root' })
export class PsicologoService {
  private readonly http = inject(HttpClient);

  /** Administrador: tabla de psicólogos. */
  listar(buscar = '', activo: boolean | null = null): Observable<PsicologoLista[]> {
    let params = new HttpParams();

    if (buscar.trim()) params = params.set('buscar', buscar.trim());
    if (activo !== null) params = params.set('activo', activo);

    return this.http.get<PsicologoLista[]>(`${API_URL}/psicologo`, { params });
  }

  obtenerDetalle(id: number): Observable<PsicologoDetalle> {
    return this.http.get<PsicologoDetalle>(`${API_URL}/psicologo/${id}`);
  }

  crear(datos: PsicologoCrear): Observable<PsicologoLista> {
    return this.http.post<PsicologoLista>(`${API_URL}/psicologo`, datos);
  }

  actualizar(id: number, datos: PsicologoActualizar): Observable<PsicologoLista> {
    return this.http.put<PsicologoLista>(`${API_URL}/psicologo/${id}`, datos);
  }

  /** Psicólogo: su propio resumen (perfil, próximas citas, solicitudes asignadas y horarios). */
  obtenerMiResumen(): Observable<PsicologoDetalle> {
    return this.http.get<PsicologoDetalle>(`${API_URL}/psicologo/yo`);
  }
}
