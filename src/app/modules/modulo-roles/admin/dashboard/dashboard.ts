import { Component, computed, inject, signal } from '@angular/core';

import { Dashboard as DashboardDatos } from '../../../../core/models/dashboard.model';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { fechaLarga, hora } from '../../../../core/utils/fechas';

/** Dashboard del administrador: números y gráfico reales del sistema. */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);

  protected readonly datos = signal<DashboardDatos | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  /** Cada indicador lleva a la sección donde se atiende. */
  protected readonly indicadores = computed(() => {
    const d = this.datos();
    if (!d) return [];

    return [
      { titulo: 'Usuarios activos', valor: d.usuariosActivos, ruta: 'usuarios', atencion: false },
      { titulo: 'Psicólogos activos', valor: d.psicologosActivos, ruta: 'psicologos', atencion: false },
      { titulo: 'Citas de hoy', valor: d.citasHoy, ruta: 'citas', atencion: false },
      { titulo: 'Citas en 7 días', valor: d.citasProximos7Dias, ruta: 'citas', atencion: false },
      { titulo: 'Solicitudes pendientes', valor: d.solicitudesPendientes, ruta: 'solicitudes', atencion: d.solicitudesPendientes > 0 },
      { titulo: 'Mensajes sin leer', valor: d.mensajesSinLeer, ruta: 'mensajes', atencion: d.mensajesSinLeer > 0 },
      { titulo: 'Eventos publicados', valor: d.eventosPublicados, ruta: 'eventos', atencion: false },
      { titulo: 'Correos pendientes', valor: d.correosPendientes, ruta: 'correos', atencion: d.correosPendientes > 0 },
    ];
  });

  protected readonly maximoCitas = computed(() => Math.max(1, ...(this.datos()?.citasPorDia ?? []).map((d) => d.cantidad)));

  protected readonly fecha = fechaLarga;
  protected readonly hora = hora;

  constructor() {
    this.dashboardService.obtener().subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el resumen.');
        this.cargando.set(false);
      },
    });
  }

  /** "2026-09-21" a "lun 21". El mediodía evita que un cambio de zona lo pase al día anterior. */
  protected etiquetaDia(fecha: string): string {
    return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
  }
}
