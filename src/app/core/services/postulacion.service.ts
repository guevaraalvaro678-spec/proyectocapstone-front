import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  ArchivoSubido,
  Postulacion,
  PostulacionCrear,
  PostulacionEstado,
  SesionEntrevista,
  SesionEntrevistaDetalle,
  SesionEntrevistaGuardar,
} from '../models/postulacion.model';

/** Proceso de selección: postulaciones, CV y sesiones de entrevista grupal. */
@Injectable({ providedIn: 'root' })
export class PostulacionService {
  private readonly http = inject(HttpClient);

  // ---- Postulante ----

  subirCv(archivo: File): Observable<ArchivoSubido> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http.post<ArchivoSubido>(`${API_URL}/archivo/cv`, datos);
  }

  crear(datos: PostulacionCrear): Observable<Postulacion> {
    return this.http.post<Postulacion>(`${API_URL}/postulacion`, datos);
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
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    if (estado) params = params.set('estado', estado);
    if (buscar) params = params.set('buscar', buscar);
    return this.http.get<Postulacion[]>(`${API_URL}/postulacion`, { params });
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

  cambiarEstadoSesion(id: number, estado: 'Programada' | 'Realizada' | 'Cancelada'): Observable<SesionEntrevista> {
    return this.http.put<SesionEntrevista>(`${API_URL}/entrevista/${id}/estado`, { estado });
  }
}
