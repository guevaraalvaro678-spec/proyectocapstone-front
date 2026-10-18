import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Sesion } from '../models/auth.model';
import { Cuenta, CuentaPerfil, DashboardOng } from '../models/cuenta.model';
import { AuthService } from './auth.service';
import { GoogleService } from './google.service';

/** Cuenta propia ("Crea tu cuenta", Google, "Mi cuenta y seguridad") y el dashboard de la ONG. */
@Injectable({ providedIn: 'root' })
export class CuentaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly google = inject(GoogleService);

  /** Crea la cuenta (rol Postulante) y deja la sesión iniciada. */
  registrar(correo: string, password: string): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_URL}/cuenta/registro`, { correo, password })
      .pipe(tap((s) => this.auth.iniciarSesion(s)));
  }

  /** Entra con Google. Con `crear` en false, si el correo no tiene cuenta responde 404 y no la crea. */
  entrarConGoogle(credential: string, crear = true): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_URL}/cuenta/google`, { credential }, { params: { crear } })
      .pipe(tap((s) => this.auth.iniciarSesion(s)));
  }

  /**
   * Botón "Continuar con Google" del login y de "Crea tu cuenta":
   * - 'sesion': el correo ya tenía cuenta y quedó logueado.
   * - 'nuevo': no tiene cuenta; se guardan sus datos de Google para llevarlo al formulario de postulación,
   *   donde elige voluntario o practicante. La cuenta se crea recién al enviar la postulación.
   */
  continuarConGoogle(credential: string): Observable<'sesion' | 'nuevo'> {
    return this.entrarConGoogle(credential, false).pipe(
      map(() => 'sesion' as const),
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 404) return throwError(() => err);
        return this.google.perfil(credential).pipe(
          tap((perfil) => {
            this.google.credencialPendiente.set(credential);
            this.google.perfilPendiente.set(perfil);
          }),
          map(() => 'nuevo' as const),
        );
      }),
    );
  }

  /** Pide un token con el rol actual (por ejemplo, cuando aceptaron la postulación). */
  renovarSesion(): Observable<Sesion> {
    return this.http.post<Sesion>(`${API_URL}/cuenta/renovar`, {}).pipe(tap((s) => this.auth.iniciarSesion(s)));
  }

  yo(): Observable<Cuenta> {
    return this.http.get<Cuenta>(`${API_URL}/cuenta/yo`);
  }

  actualizarPerfil(datos: CuentaPerfil): Observable<Cuenta> {
    return this.http
      .put<Cuenta>(`${API_URL}/cuenta/perfil`, datos)
      .pipe(tap((c) => this.auth.actualizarNombre(c.nombre)));
  }

  cambiarPassword(actual: string, nueva: string): Observable<void> {
    return this.http.put<void>(`${API_URL}/cuenta/password`, { actual, nueva });
  }

  dashboard(): Observable<DashboardOng> {
    return this.http.get<DashboardOng>(`${API_URL}/dashboard/ong`);
  }
}
