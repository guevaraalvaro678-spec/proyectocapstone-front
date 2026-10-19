import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../config/api.config';
import { AudienciaCorreo, Correo, CorreoEnviar, CorreoEnvioResultado, CorreoEstado } from '../Models/correo.model';

/** Correos y notificaciones que controla el administrador. */
@Injectable({ providedIn: 'root' })
export class CorreoService {
  private readonly http = inject(HttpClient);

  historial(): Observable<Correo[]> {
    return this.http.get<Correo[]>(`${API_URL}/correo`);
  }

  /** Grupos a los que se puede enviar, con el texto que define el backend. */
  audiencias(): Observable<{ valor: AudienciaCorreo; texto: string }[]> {
    return this.http.get<{ valor: AudienciaCorreo; texto: string }[]>(`${API_URL}/correo/audiencias`);
  }

  obtenerEstado(): Observable<CorreoEstado> {
    return this.http.get<CorreoEstado>(`${API_URL}/correo/estado`);
  }

  enviar(datos: CorreoEnviar): Observable<CorreoEnvioResultado> {
    return this.http.post<CorreoEnvioResultado>(`${API_URL}/correo/enviar`, datos);
  }

  reintentar(id: number): Observable<void> {
    return this.http.post<void>(`${API_URL}/correo/${id}/reintentar`, {});
  }
}
