import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../config/api.config';
import { AlertasResumen, BandejaRrhh, IndicadoresProceso, Respaldo, RespaldoEstado } from '../Models/panel.model';

/** Bandeja de Recursos Humanos, indicadores del proceso, alertas de seguridad y copias de seguridad. */
@Injectable({ providedIn: 'root' })
export class PanelService {
  private readonly http = inject(HttpClient);

  bandeja(): Observable<BandejaRrhh> {
    return this.http.get<BandejaRrhh>(`${API_URL}/dashboard/bandeja`);
  }

  indicadores(): Observable<IndicadoresProceso> {
    return this.http.get<IndicadoresProceso>(`${API_URL}/dashboard/indicadores`);
  }

  alertas(soloPendientes = false): Observable<AlertasResumen> {
    const params = new HttpParams().set('soloPendientes', soloPendientes);
    return this.http.get<AlertasResumen>(`${API_URL}/alerta`, { params });
  }

  marcarRevisada(id: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/alerta/${id}/revisada`, {});
  }

  marcarTodasRevisadas(): Observable<void> {
    return this.http.put<void>(`${API_URL}/alerta/revisadas`, {});
  }

  respaldos(): Observable<RespaldoEstado> {
    return this.http.get<RespaldoEstado>(`${API_URL}/respaldo`);
  }

  respaldar(): Observable<Respaldo> {
    return this.http.post<Respaldo>(`${API_URL}/respaldo`, {});
  }
}
