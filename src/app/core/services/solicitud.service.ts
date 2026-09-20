import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { EstadoSolicitud, Solicitud } from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private readonly http = inject(HttpClient);

  /** Usuario: pide orientación (solo puede tener una solicitud abierta). */
  crear(motivo: string): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${API_URL}/solicitud`, { motivo });
  }

  /** Usuario: su solicitud más reciente, o null si nunca pidió orientación. */
  obtenerMia(): Observable<Solicitud | null> {
    return this.http.get<Solicitud | null>(`${API_URL}/solicitud/mia`);
  }

  /** Administrador: todas las solicitudes. */
  listar(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${API_URL}/solicitud`);
  }

  /** Psicólogo: las solicitudes abiertas que le asignaron. */
  listarAsignadas(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${API_URL}/solicitud/asignadas`);
  }

  /** Administrador: cambia el estado. Para "Asignada" hay que indicar el psicólogo. */
  cambiarEstado(id: number, estado: EstadoSolicitud, psicologoId: number | null = null): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${API_URL}/solicitud/${id}/estado`, { estado, psicologoId });
  }
}
