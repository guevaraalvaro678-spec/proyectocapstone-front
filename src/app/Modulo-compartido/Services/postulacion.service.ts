import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../../config/api.config';
import {
  Postulacion,
  PostulacionCrear,
  PostulacionEnviada,
  PostulacionEstado,
  PostulacionResumen,
  SesionEntrevista,
  SesionEntrevistaDetalle,
  SesionEntrevistaGuardar,
} from '../Models/postulacion.model';
import { AuthService } from './auth.service';

/** Proceso de selección: postulaciones, CV y sesiones de entrevista grupal. */
@Injectable({ providedIn: 'root' })
export class PostulacionService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  // ---- Postulante ----

  /** Áreas a las que se puede postular (las define el backend). */
  areas(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/catalogo/areas`);
  }

  /**
   * Envía el formulario completo en una sola operación: el backend crea la cuenta si hace falta
   * (con correo y contraseña o con Google), guarda el CV (solo practicantes) y registra la postulación.
   */
  enviarCompleta(
    datos: PostulacionCrear,
    cv: File | null,
    cuenta?: { correo?: string; password?: string; googleCredential?: string; aceptaTerminos: boolean },
  ): Observable<PostulacionEnviada> {
    const form = new FormData();
    for (const [clave, valor] of Object.entries({ ...datos, ...cuenta })) {
      if (valor !== undefined && valor !== null && valor !== '') form.append(clave, String(valor));
    }
    if (cv) form.append('cv', cv);
    return this.http
      .post<PostulacionEnviada>(`${API_URL}/postulacion/completa`, form)
      .pipe(tap((r) => r.sesion && this.auth.iniciarSesion(r.sesion)));
  }

  /** La postulación de la cuenta actual, o null si todavía no postuló. */
  obtenerMia(): Observable<Postulacion | null> {
    return this.http.get<Postulacion | null>(`${API_URL}/postulacion/mia`);
  }

  /** Descarga un archivo (el CV) con el token, para abrirlo en otra pestaña. */
  descargarArchivo(id: number): Observable<Blob> {
    return this.http.get(`${API_URL}/archivo/${id}`, { responseType: 'blob' });
  }

  // ---- Gestión (administrador y Recursos Humanos) ----

  listar(tipo = '', estado = '', buscar = ''): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${API_URL}/postulacion`, { params: this.filtros(tipo, estado, buscar) });
  }

  /** Indicadores con los mismos filtros de la lista. */
  resumen(tipo = '', estado = '', buscar = ''): Observable<PostulacionResumen> {
    return this.http.get<PostulacionResumen>(`${API_URL}/postulacion/resumen`, { params: this.filtros(tipo, estado, buscar) });
  }

  /** CSV generado por el backend con los filtros aplicados. */
  exportar(tipo = '', estado = '', buscar = ''): Observable<Blob> {
    return this.http.get(`${API_URL}/postulacion/exportar`, { params: this.filtros(tipo, estado, buscar), responseType: 'blob' });
  }

  private filtros(tipo: string, estado: string, buscar: string): HttpParams {
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    if (estado) params = params.set('estado', estado);
    if (buscar) params = params.set('buscar', buscar);
    return params;
  }

  obtener(id: number): Observable<Postulacion> {
    return this.http.get<Postulacion>(`${API_URL}/postulacion/${id}`);
  }

  cambiarEstado(id: number, datos: PostulacionEstado): Observable<Postulacion> {
    return this.http.put<Postulacion>(`${API_URL}/postulacion/${id}/estado`, datos);
  }

  listarSesiones(estado = ''): Observable<SesionEntrevista[]> {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.http.get<SesionEntrevista[]>(`${API_URL}/entrevista`, { params });
  }

  obtenerSesion(id: number): Observable<SesionEntrevistaDetalle> {
    return this.http.get<SesionEntrevistaDetalle>(`${API_URL}/entrevista/${id}`);
  }

  crearSesion(datos: SesionEntrevistaGuardar): Observable<SesionEntrevista> {
    return this.http.post<SesionEntrevista>(`${API_URL}/entrevista`, datos);
  }

  actualizarSesion(id: number, datos: SesionEntrevistaGuardar): Observable<SesionEntrevista> {
    return this.http.put<SesionEntrevista>(`${API_URL}/entrevista/${id}`, datos);
  }

  cambiarEstadoSesion(id: number, estado: 'Realizada' | 'Cancelada'): Observable<SesionEntrevista> {
    return this.http.put<SesionEntrevista>(`${API_URL}/entrevista/${id}/estado`, { estado });
  }
}
