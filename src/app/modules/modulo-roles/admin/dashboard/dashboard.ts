import { Component, computed, inject, signal } from '@angular/core';

import { DashboardOng } from '../../../../core/models/cuenta.model';
import { ESTADOS_POSTULACION, ETIQUETA_POSTULACION } from '../../../../core/models/postulacion.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CuentaService } from '../../../../core/services/cuenta.service';

/** Dashboard de la ONG: proceso de selección, comunidad, donaciones y próximas entrevistas (datos reales). */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly cuentaService = inject(CuentaService);
  protected readonly auth = inject(AuthService);

  protected readonly datos = signal<DashboardOng | null>(null);
  protected readonly error = signal('');

  /** Embudo: cuántas postulaciones llegaron a cada etapa (o más allá). */
  protected readonly embudo = computed(() => {
    const d = this.datos();
    if (!d) return [];
    const total = d.totalPostulaciones;
    const cuenta = (e: (typeof ESTADOS_POSTULACION)[number]) => d.postulaciones[e] ?? 0;
    // Una postulación que ya avanzó también "pasó" por las etapas anteriores.
    const desde = (indice: number) =>
      ESTADOS_POSTULACION.slice(indice, 5).reduce((s, e) => s + cuenta(e), 0) + cuenta('Aceptada') + cuenta('NoAdmitida');

    return ESTADOS_POSTULACION.map((estado, i) => {
      const valor = i < 5 ? (i === 0 ? total : desde(i)) : cuenta(estado);
      return {
        etiqueta: `${i + 1}. ${i === 0 ? 'Postulaciones recibidas' : ETIQUETA_POSTULACION[estado]}`,
        valor,
        porcentaje: total ? Math.round((valor / total) * 100) : 0,
        alerta: estado === 'EnCalificacion',
      };
    });
  });

  protected readonly pendientes = computed(() => {
    const p = this.datos()?.postulaciones;
    return p ? (p.Recibida ?? 0) + (p.HabilitadaEntrevista ?? 0) : 0;
  });

  protected readonly evaluaciones = computed(() => {
    const p = this.datos()?.postulaciones;
    return p ? (p.EntrevistaRealizada ?? 0) + (p.EnCalificacion ?? 0) : 0;
  });

  protected readonly miembros = computed(() => (this.datos()?.voluntarios ?? 0) + (this.datos()?.practicantes ?? 0));

  protected readonly pctVoluntarios = computed(() =>
    this.miembros() ? Math.round(((this.datos()?.voluntarios ?? 0) / this.miembros()) * 100) : 0,
  );

  protected readonly donaciones = computed(() => {
    const d = this.datos()?.donaciones ?? {};
    const pendientes = d.PendienteRecepcion ?? 0;
    const recibidas = d.Recibida ?? 0;
    const descartadas = d.Desestimada ?? 0;
    const total = pendientes + recibidas + descartadas;
    const pct = (n: number) => (total ? Math.round((n / total) * 1000) / 10 : 0);
    return { total, pendientes, recibidas, descartadas, pPendientes: pct(pendientes), pRecibidas: pct(recibidas), pDescartadas: pct(descartadas) };
  });

  constructor() {
    this.cuentaService.dashboard().subscribe({
      next: (d) => this.datos.set(d),
      error: () => this.error.set('No se pudieron cargar los indicadores'),
    });
  }
}
