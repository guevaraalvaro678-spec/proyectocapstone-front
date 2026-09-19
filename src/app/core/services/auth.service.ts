import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../config/api.config';
import { LoginRequest, RegistroRequest, Sesion, UsuarioCreado } from '../models/auth.model';

const CLAVE_SESION = 'sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _sesion = signal<Sesion | null>(this.leerSesion());

  readonly sesion = this._sesion.asReadonly();
  readonly autenticado = computed(() => this._sesion() !== null);
  readonly esSuperAdmin = computed(() => this._sesion()?.rol === 'SuperAdmin');

  login(datos: LoginRequest): Observable<Sesion> {
    return this.http.post<Sesion>(`${API_URL}/admin/login`, datos).pipe(
      tap((sesion) => {
        this._sesion.set(sesion);
        sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
      }),
    );
  }

  /** Solo un SuperAdmin puede crear usuarios; el token viaja en el interceptor. */
  crearUsuario(datos: RegistroRequest): Observable<UsuarioCreado> {
    return this.http.post<UsuarioCreado>(`${API_URL}/admin/registro`, datos);
  }

  logout(): void {
    this._sesion.set(null);
    sessionStorage.removeItem(CLAVE_SESION);
    this.router.navigate(['/login']);
  }

  private leerSesion(): Sesion | null {
    try {
      const guardada = sessionStorage.getItem(CLAVE_SESION);
      const sesion = guardada ? (JSON.parse(guardada) as Sesion) : null;
      // Una sesión guardada sin token (versión anterior) ya no sirve.
      return sesion?.token ? sesion : null;
    } catch {
      return null;
    }
  }
}
