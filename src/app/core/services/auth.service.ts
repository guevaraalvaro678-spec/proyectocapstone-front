import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  LoginRequest,
  RegistroRequest,
  RegistroUsuarioRequest,
  Sesion,
  UsuarioCreado,
} from '../models/auth.model';

const CLAVE_SESION = 'sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _sesion = signal<Sesion | null>(this.leerSesion());

  readonly sesion = this._sesion.asReadonly();
  readonly autenticado = computed(() => this._sesion() !== null);
  readonly esSuperAdmin = computed(() => this._sesion()?.rol === 'SuperAdmin');
  readonly esAdmin = computed(() => {
    const rol = this._sesion()?.rol;
    return rol === 'SuperAdmin' || rol === 'Admin';
  });
  readonly esPsicologo = computed(() => this._sesion()?.rol === 'Psicologo');
  readonly esUsuario = computed(() => this._sesion()?.rol === 'Usuario');

  /** Login de cualquier cuenta: administradores (por usuario) y usuarios o psicólogos (por correo). */
  login(datos: LoginRequest): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_URL}/admin/login`, datos)
      .pipe(tap((sesion) => this.guardarSesion(sesion)));
  }

  /** Registro público de un usuario común; la respuesta ya trae la sesión, así que queda logueado. */
  registrarUsuario(datos: RegistroUsuarioRequest): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_URL}/usuario/registro`, datos)
      .pipe(tap((sesion) => this.guardarSesion(sesion)));
  }

  /** Solo un SuperAdmin puede crear administradores; el token viaja en el interceptor. */
  crearUsuario(datos: RegistroRequest): Observable<UsuarioCreado> {
    return this.http.post<UsuarioCreado>(`${API_URL}/admin/registro`, datos);
  }

  /** A dónde debe ir cada cuenta después de iniciar sesión. */
  rutaInicial(): string {
    if (this.esAdmin()) return '/admin';
    if (this.esPsicologo()) return '/psicologo';
    return '/mi-espacio';
  }

  /** Cierra la sesión y lleva a `destino` (por defecto al login). */
  logout(destino = '/login'): void {
    this._sesion.set(null);
    sessionStorage.removeItem(CLAVE_SESION);
    this.router.navigate([destino]);
  }

  /** Refleja en la sesión el nombre que el usuario acaba de cambiar en su perfil. */
  actualizarNombre(nombre: string): void {
    const actual = this._sesion();
    if (actual) this.guardarSesion({ ...actual, nombre });
  }

  private guardarSesion(sesion: Sesion): void {
    this._sesion.set(sesion);
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  private leerSesion(): Sesion | null {
    try {
      const guardada = sessionStorage.getItem(CLAVE_SESION);
      const sesion = guardada ? (JSON.parse(guardada) as Sesion) : null;
      // Una sesión sin token (versión anterior) o con el token vencido ya no sirve.
      if (!sesion?.token || !this.tokenVigente(sesion.token)) {
        sessionStorage.removeItem(CLAVE_SESION);
        return null;
      }
      return sesion;
    } catch {
      return null;
    }
  }

  /** Lee la fecha de vencimiento (`exp`) del JWT; el backend igual lo valida en cada petición. */
  private tokenVigente(token: string): boolean {
    try {
      const cuerpo = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(cuerpo)) as { exp?: number };
      return typeof exp !== 'number' || exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
