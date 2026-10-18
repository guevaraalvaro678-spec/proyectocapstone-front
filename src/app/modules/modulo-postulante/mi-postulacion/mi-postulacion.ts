import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ETIQUETA_POSTULACION, Postulacion } from '../../../core/models/postulacion.model';
import { AuthService } from '../../../core/services/auth.service';
import { CuentaService } from '../../../core/services/cuenta.service';
import { PostulacionService } from '../../../core/services/postulacion.service';

/** Seguimiento de la postulación en 5 pasos, con la sesión de entrevista grupal y el resultado. */
@Component({
  selector: 'app-mi-postulacion',
  standalone: false,
  templateUrl: './mi-postulacion.html',
  styleUrl: './mi-postulacion.scss',
})
export class MiPostulacion {
  private readonly postulacionService = inject(PostulacionService);
  private readonly cuentaService = inject(CuentaService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly etiquetas = ETIQUETA_POSTULACION;
  protected readonly postulacion = signal<Postulacion | null>(null);
  protected readonly cargando = signal(true);

  /** Paso actual (1 a 5) según el estado. */
  protected readonly paso = computed(() => {
    const e = this.postulacion()?.estado;
    return e === 'Recibida' ? 1 : e === 'HabilitadaEntrevista' ? 2 : e === 'EntrevistaAgendada' ? 3 : e === 'Aceptada' || e === 'NoAdmitida' ? 5 : 4;
  });

  protected readonly pasos = ['Postulación recibida', 'Habilitado para entrevista', 'Entrevista programada', 'En evaluación', 'Resultado'];

  constructor() {
    this.postulacionService.obtenerMia().subscribe({
      next: (p) => {
        this.postulacion.set(p);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  /** Aceptado: pide un token con el nuevo rol y entra a su portal. */
  protected irAMiPortal(): void {
    this.cuentaService.renovarSesion().subscribe(() => this.router.navigate([this.auth.rutaInicial()]));
  }
}
