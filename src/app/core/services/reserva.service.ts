import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Cita } from '../models/cita.model';
import { HorarioDisponible, PsicologoPublico, ReservaCrear } from '../models/disponibilidad.model';

/** Reserva de citas del paciente: elige psicólogo, ve sus horarios libres y reserva. */
@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly http = inject(HttpClient);

  listarPsicologos(): Observable<PsicologoPublico[]> {
    return this.http.get<PsicologoPublico[]>(`${API_URL}/reserva/psicologos`);
  }

  listarHorarios(psicologoId: number, dias = 14): Observable<HorarioDisponible[]> {
    const params = new HttpParams().set('psicologoId', psicologoId).set('dias', dias);
    return this.http.get<HorarioDisponible[]>(`${API_URL}/reserva/horarios`, { params });
  }

  reservar(datos: ReservaCrear): Observable<Cita> {
    return this.http.post<Cita>(`${API_URL}/reserva`, datos);
  }
}
