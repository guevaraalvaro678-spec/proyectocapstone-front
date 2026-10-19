import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../../config/api.config';
import {
  CanalVerificacion,
  CodigoEnviado,
  LoginRequest,
  LoginResultado,
  RegistroRequest,
  Sesion,
  UsuarioCreado,
} from '../Models/auth.model';

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
  readonly esRRHH = computed(() => this._sesion()?.rol === 'RRHH');
  readonly esVoluntario = computed(() => this._sesion()?.rol === 'Voluntario');
  readonly esPracticante = computed(() => this._sesion()?.rol === 'Practicante');
  readonly esPostulante = computed(() => this._sesion()?.rol === 'Postulante');
  /** Voluntario o practicante: ya forma parte de AMAAC. */
  readonly esMiembro = computed(() => this.esVoluntario() || this.esPracticante());
  /** Quien gestiona voluntarios y practicantes: administradores y Recursos Humanos. */
  readonly esGestion = computed(() => this.esAdmin() || this.esRRHH());

  /**
   * Primer paso del login (usuario y contraseña). Si el backend pide verificación en dos pasos, todavía
   * no hay sesión: llega un desafío para pedir el código.
   */
  login(datos: LoginRequest): Observable<LoginResultado> {
    return this.http
      .post<LoginResultado>(`${API_URL}/admin/login`, datos)
      .pipe(tap((r) => r.sesion && this.guardarSesion(r.sesion)));
  }

  /** Pide el código de verificación por correo o SMS. */
  solicitarCodigo(desafio: string, canal: CanalVerificacion['canal']): Observable<CodigoEnviado> {
    return this.http.post<CodigoEnviado>(`${API_URL}/admin/login/codigo`, { desafio, canal });
  }

  /** Segundo paso: con el código correcto el backend entrega la sesión. */
  verificarCodigo(desafio: string, codigo: string): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_URL}/admin/login/verificar`, { desafio, codigo })
      .pipe(tap((sesion) => this.guardarSesion(sesion)));
  }


  /** Login con el token que entrega el botón de Google (la cuenta debe existir). */
  loginGoogle(credential: string): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${API_URL}/admin/google`, { credential })
      .pipe(tap((sesion) => this.guardarSesion(sesion)));
  }

  /** Solo un SuperAdmin puede crear administradores; el token viaja en el interceptor. */
  crearUsuario(datos: RegistroRequest): Observable<UsuarioCreado> {
    return this.http.post<UsuarioCreado>(`${API_URL}/admin/registro`, datos);
  }

  /** A dónde debe ir cada cuenta después de iniciar sesión. */
  rutaInicial(): string {
    if (this.esAdmin()) return '/admin';
    if (this.esRRHH()) return '/admin/practicantes';
    if (this.esPracticante()) return '/practicante';
    if (this.esPostulante()) return '/mi-postulacion';
    return '/voluntario';
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

  /** Deja la sesión iniciada (lo usa el registro de practicantes, que ya devuelve el token). */
  iniciarSesion(sesion: Sesion): void {
    this.guardarSesion(sesion);
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
