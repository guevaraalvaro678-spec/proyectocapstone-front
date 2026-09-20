import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Colaborador, ColaboradorPostulacion } from '../models/colaborador.model';

@Injectable({ providedIn: 'root' })
export class ColaboradorService {
  private readonly http = inject(HttpClient);

  /** Público: un psicólogo postula para colaborar. No crea cuenta hasta que el administrador apruebe. */
  postular(datos: ColaboradorPostulacion): Observable<unknown> {
    return this.http.post(`${API_URL}/colaborador`, datos);
  }

  /** Administrador: solicitudes de colaboradores, opcionalmente filtradas por estado. */
  listar(estado = ''): Observable<Colaborador[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<Colaborador[]>(`${API_URL}/colaborador`, { params });
  }

  aprobar(id: number): Observable<Colaborador> {
    return this.http.put<Colaborador>(`${API_URL}/colaborador/${id}/aprobar`, {});
  }

  rechazar(id: number, motivo: string): Observable<Colaborador> {
    return this.http.put<Colaborador>(`${API_URL}/colaborador/${id}/rechazar`, { motivo });
  }
}
