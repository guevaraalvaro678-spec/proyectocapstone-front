import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';

import { DashboardOng } from '../../../Modulo-compartido/Models/cuenta.model';
import { AuthService } from '../../../Modulo-compartido/Services/auth.service';
import { CuentaService } from '../../../Modulo-compartido/Services/cuenta.service';

/** Dashboard de la ONG: proceso de selección, comunidad, donaciones y próximas entrevistas (datos reales). */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './rol-dashboard.html',
  styleUrl: './rol-dashboard.scss',
})
export class Dashboard {
  private readonly cuentaService = inject(CuentaService);
  protected readonly auth = inject(AuthService);

  protected readonly datos = signal<DashboardOng | null>(null);
  protected readonly error = signal('');
  protected readonly actualizado = signal<Date | null>(null);

  // Todos los indicadores llegan calculados del backend (GET api/dashboard/ong); aquí solo se leen.
  protected readonly embudo = computed(() => this.datos()?.embudo ?? []);
  protected readonly pendientes = computed(() => this.datos()?.pendientesAtencion ?? 0);
  protected readonly evaluaciones = computed(() => this.datos()?.enEvaluacion ?? 0);
  protected readonly miembros = computed(() => this.datos()?.miembros ?? 0);
  protected readonly pctVoluntarios = computed(() => this.datos()?.porcentajeVoluntarios ?? 0);

  protected readonly donaciones = computed(() => {
    const r = this.datos()?.resumenDonaciones;
    return {
      total: r?.total ?? 0,
      pendientes: r?.pendientes ?? 0,
      recibidas: r?.recibidas ?? 0,
      descartadas: r?.desestimadas ?? 0,
      pPendientes: r?.porcentajePendientes ?? 0,
      pRecibidas: r?.porcentajeRecibidas ?? 0,
      pDescartadas: r?.porcentajeDesestimadas ?? 0,
    };
  });

  constructor() {
    // Se actualiza solo cada minuto mientras el dashboard está abierto.
    timer(0, 60_000)
      .pipe(
        switchMap(() =>
          this.cuentaService.dashboard().pipe(
            catchError(() => {
              this.error.set('No se pudieron cargar los indicadores');
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((d) => {
        this.error.set('');
        this.datos.set(d);
        this.actualizado.set(new Date());
      });
  }
}
