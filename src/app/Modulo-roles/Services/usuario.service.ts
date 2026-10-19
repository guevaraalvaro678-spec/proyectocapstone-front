import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../config/api.config';
import { UsuarioPerfil, UsuarioPerfilActualizar } from '../Models/usuario.model';
import { TipoUsuario, UsuarioDetalle, UsuarioLista } from '../Models/usuario-admin.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  // ---- Mi perfil ----

  obtenerPerfil(): Observable<UsuarioPerfil> {
    return this.http.get<UsuarioPerfil>(`${API_URL}/usuario/perfil`);
  }

  actualizarPerfil(datos: UsuarioPerfilActualizar): Observable<UsuarioPerfil> {
    return this.http.put<UsuarioPerfil>(`${API_URL}/usuario/perfil`, datos);
  }

  // ---- Recuperar contraseña (público) ----

  /** Responde igual exista o no la cuenta, para no revelar qué correos están registrados. */
  solicitarRecuperacion(correo: string): Observable<void> {
    return this.http.post<void>(`${API_URL}/usuario/olvide-password`, { correo });
  }

  restablecerPassword(correo: string, token: string, nuevaPassword: string): Observable<void> {
    return this.http.post<void>(`${API_URL}/usuario/restablecer-password`, { correo, token, nuevaPassword });
  }

  // ---- Administración ----

  listar(tipo: TipoUsuario = 'Usuario', buscar = '', activo: boolean | null = null): Observable<UsuarioLista[]> {
    let params = new HttpParams().set('tipo', tipo);

    if (buscar.trim()) params = params.set('buscar', buscar.trim());
    if (activo !== null) params = params.set('activo', activo);

    return this.http.get<UsuarioLista[]>(`${API_URL}/usuario`, { params });
  }

  obtenerDetalle(id: number): Observable<UsuarioDetalle> {
    return this.http.get<UsuarioDetalle>(`${API_URL}/usuario/${id}`);
  }

  cambiarActivo(id: number, activo: boolean): Observable<UsuarioLista> {
    return this.http.put<UsuarioLista>(`${API_URL}/usuario/${id}/activo`, { activo });
  }
}
