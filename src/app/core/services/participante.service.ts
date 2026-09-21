import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Sesion } from '../models/auth.model';
import {
  BloqueHorario,
  HorarioRevision,
  Marcacion,
  Practicante,
  PracticanteRegistro,
  Tarea,
  TareaCrear,
  Voluntario,
  VoluntarioRegistro,
} from '../models/participante.model';
import { AuthService } from './auth.service';

/** Voluntarios y practicantes: registro público, sus datos, horarios, tareas y asistencia. */
@Injectable({ providedIn: 'root' })
export class ParticipanteService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  // ---- Público ----

  /** Con Google la respuesta trae la sesión y queda logueado; si no, solo un mensaje (la clave llega por correo). */
  registrarVoluntario(datos: VoluntarioRegistro): Observable<Sesion | { mensaje: string }> {
    return this.http.post<Sesion | { mensaje: string }>(`${API_URL}/voluntario/registro`, datos).pipe(
      tap((respuesta) => {
        if ('token' in respuesta) this.auth.iniciarSesion(respuesta);
      }),
    );
  }

  /** El practicante elige su contraseña, así que la respuesta ya trae la sesión. */
  registrarPracticante(datos: PracticanteRegistro): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_URL}/practicante/registro`, datos)
      .pipe(tap((sesion) => this.auth.iniciarSesion(sesion)));
  }

  // ---- Voluntario ----

  miPerfilVoluntario(): Observable<Voluntario> {
    return this.http.get<Voluntario>(`${API_URL}/voluntario/yo`);
  }

  // ---- Practicante ----

  miPerfilPracticante(): Observable<Practicante> {
    return this.http.get<Practicante>(`${API_URL}/practicante/yo`);
  }

  enviarHorario(bloques: BloqueHorario[]): Observable<Practicante> {
    return this.http.put<Practicante>(`${API_URL}/practicante/yo/horario`, { bloques });
  }

  marcarEntrada(): Observable<Marcacion> {
    return this.http.post<Marcacion>(`${API_URL}/marcacion/entrada`, {});
  }

  marcarSalida(): Observable<Marcacion> {
    return this.http.post<Marcacion>(`${API_URL}/marcacion/salida`, {});
  }

  misMarcaciones(): Observable<Marcacion[]> {
    return this.http.get<Marcacion[]>(`${API_URL}/marcacion/mias`);
  }

  // ---- Tareas (voluntario o practicante) ----

  misTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${API_URL}/tarea/mias`);
  }

  cambiarEstadoTarea(id: number, estado: 'Pendiente' | 'Completada'): Observable<Tarea> {
    return this.http.put<Tarea>(`${API_URL}/tarea/${id}/estado`, { estado });
  }

  // ---- Administrador y Recursos Humanos ----

  listarVoluntarios(buscar = ''): Observable<Voluntario[]> {
    return this.http.get<Voluntario[]>(`${API_URL}/voluntario`, { params: this.params({ buscar }) });
  }

  listarPracticantes(estado = '', buscar = ''): Observable<Practicante[]> {
    return this.http.get<Practicante[]>(`${API_URL}/practicante`, { params: this.params({ estado, buscar }) });
  }

  revisarHorario(usuarioId: number, datos: HorarioRevision): Observable<Practicante> {
    return this.http.put<Practicante>(`${API_URL}/practicante/${usuarioId}/horario`, datos);
  }

  listarTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${API_URL}/tarea`);
  }

  crearTarea(datos: TareaCrear): Observable<Tarea> {
    return this.http.post<Tarea>(`${API_URL}/tarea`, datos);
  }

  listarAsistencia(soloHoy: boolean): Observable<Marcacion[]> {
    return this.http.get<Marcacion[]>(`${API_URL}/marcacion`, { params: this.params({ soloHoy }) });
  }

  private params(valores: Record<string, string | boolean>): HttpParams {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(valores)) {
      if (valor !== '') params = params.set(clave, String(valor));
    }
    return params;
  }
}
