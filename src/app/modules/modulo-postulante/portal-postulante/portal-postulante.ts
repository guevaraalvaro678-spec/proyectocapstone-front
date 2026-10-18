import { Component, computed, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { GoogleService } from '../../../core/services/google.service';
import { SitioService } from '../../../core/services/sitio.service';

/** Marco del portal del postulante: barra superior con sus secciones (como en el diseño "Mi postulación"). */
@Component({
  selector: 'app-portal-postulante',
  standalone: false,
  templateUrl: './portal-postulante.html',
  styleUrl: './portal-postulante.scss',
})
export class PortalPostulante {
  protected readonly auth = inject(AuthService);

  protected readonly inicial = computed(() => (this.auth.sesion()?.nombre || this.auth.sesion()?.usuario || '?').charAt(0).toUpperCase());

  private readonly google = inject(GoogleService);

  /** Quien venía de Google sin cuenta decide no postular: se olvidan sus datos. */
  protected cancelar(): void {
    this.google.credencialPendiente.set(null);
    this.google.perfilPendiente.set(null);
  }

  constructor() {
    inject(SitioService).cargar();
  }
}
