import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Contacto, ContactoCrear } from '../models/contacto.model';

@Injectable({ providedIn: 'root' })
export class ContactoService {
  private readonly http = inject(HttpClient);

  /** Público: lo usa el formulario del sitio web, no necesita sesión. */
  enviar(datos: ContactoCrear): Observable<Contacto> {
    return this.http.post<Contacto>(`${API_URL}/contacto`, datos);
  }

  /** Solo administradores con sesión (el token viaja en el interceptor). */
  listar(): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(`${API_URL}/contacto`);
  }

  marcarLeido(id: number): Observable<Contacto> {
    return this.http.put<Contacto>(`${API_URL}/contacto/${id}/leido`, {});
  }

  /** Responde por correo a quien escribió; el mensaje queda como leído. */
  responder(id: number, respuesta: string): Observable<Contacto> {
    return this.http.post<Contacto>(`${API_URL}/contacto/${id}/responder`, { respuesta });
  }
}
