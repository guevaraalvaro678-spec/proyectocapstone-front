import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;

export interface GooglePerfil {
  correo: string;
  nombres: string;
  apellidos: string;
}

/**
 * "Continuar con Google": carga el script de Google Identity Services y dibuja su botón.
 * Solo se activa si el backend tiene configurado el ClientId (sección "Google" de appsettings).
 */
@Injectable({ providedIn: 'root' })
export class GoogleService {
  private readonly http = inject(HttpClient);

  /** Cuenta de Google que intentó entrar sin tener cuenta: Únete la usa para continuar el registro. */
  readonly credencialPendiente = signal<string | null>(null);

  private readonly _clientId = signal<string | null>(null);
  private preparado: Promise<void> | null = null;

  /** Verdadero cuando ya se sabe que Google está configurado y el script cargó. */
  readonly disponible = computed(() => this._clientId() !== null && this.scriptListo());
  private readonly scriptListo = signal(false);

  /** Se puede llamar varias veces: solo consulta al backend y carga el script una vez. */
  preparar(): Promise<void> {
    this.preparado ??= this.cargar();
    return this.preparado;
  }

  /** Dibuja el botón de Google en `contenedor`; `alRecibir` recibe el token (credential) al elegir la cuenta. */
  dibujarBoton(contenedor: HTMLElement, alRecibir: (credential: string) => void): void {
    const clientId = this._clientId();
    if (!clientId || typeof google === 'undefined') return;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (respuesta: { credential: string }) => alRecibir(respuesta.credential),
    });
    contenedor.innerHTML = '';
    google.accounts.id.renderButton(contenedor, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: 280,
    });
  }

  /** Nombre y correo de la cuenta de Google (validados por el backend), para precargar el registro. */
  perfil(credential: string): Observable<GooglePerfil> {
    return this.http.post<GooglePerfil>(`${API_URL}/google/perfil`, { credential });
  }

  private async cargar(): Promise<void> {
    try {
      const config = await new Promise<{ clientId: string | null }>((resolve, reject) =>
        this.http.get<{ clientId: string | null }>(`${API_URL}/google/config`).subscribe({ next: resolve, error: reject }),
      );

      if (!config.clientId) return;

      await new Promise<void>((resolve, reject) => {
        if (typeof google !== 'undefined') return resolve();
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar Google'));
        document.head.appendChild(script);
      });

      this._clientId.set(config.clientId);
      this.scriptListo.set(true);
    } catch {
      // Sin conexión o sin configuración, los botones de Google simplemente no aparecen.
    }
  }
}
