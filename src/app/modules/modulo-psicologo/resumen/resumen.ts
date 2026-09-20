import { etiquetaEstadoCita } from '../../../core/models/cita.model';
import { Component, computed, inject, signal } from '@angular/core';

import { PsicologoDetalle } from '../../../core/models/psicologo.model';
import { PsicologoService } from '../../../core/services/psicologo.service';
import { claveDia, fechaLarga, hora, relativa } from '../../../core/utils/fechas';

/** Portada del panel del psicólogo: cuánto tiene hoy, lo que viene y si ya ofrece horarios. */
@Component({
  selector: 'app-resumen-psicologo',
  standalone: false,
  templateUrl: './resumen.html',
  styleUrl: './resumen.scss',
})
export class Resumen {
  protected readonly etiquetaEstado = etiquetaEstadoCita;
  private readonly psicologoService = inject(PsicologoService);

  protected readonly datos = signal<PsicologoDetalle | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  /** Citas programadas o confirmadas que todavía no empiezan, la más próxima primero. */
  protected readonly vigentes = computed(() =>
    (this.datos()?.citas ?? [])
      .filter((c) => (c.estado === 'Programada' || c.estado === 'Confirmada') && new Date(c.fechaInicio).getTime() > Date.now())
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)),
  );

  protected readonly citasHoy = computed(() => {
    const hoy = claveDia(new Date().toISOString());
    return this.vigentes().filter((c) => claveDia(c.fechaInicio) === hoy).length;
  });

  protected readonly horariosActivos = computed(() => (this.datos()?.disponibilidad ?? []).filter((d) => d.activo).length);

  protected readonly fecha = fechaLarga;
  protected readonly hora = hora;
  protected readonly relativa = relativa;

  constructor() {
    this.psicologoService.obtenerMiResumen().subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu resumen.');
        this.cargando.set(false);
      },
    });
  }
}
