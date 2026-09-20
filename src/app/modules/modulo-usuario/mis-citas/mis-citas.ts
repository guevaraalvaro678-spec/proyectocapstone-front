import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, output, signal } from '@angular/core';

import { Cita, etiquetaEstadoCita } from '../../../core/models/cita.model';
import { CitaService } from '../../../core/services/cita.service';
import { fechaLarga, hora, relativa } from '../../../core/utils/fechas';

/**
 * Las citas del paciente. En modo "resumen" muestra solo la próxima (para la portada de Mi espacio);
 * en modo "lista" muestra las próximas con opción de cancelar y el historial.
 */
@Component({
  selector: 'app-mis-citas',
  standalone: false,
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.scss',
})
export class MisCitas {
  protected readonly etiquetaEstado = etiquetaEstadoCita;
  private readonly citaService = inject(CitaService);

  readonly citas = input.required<Cita[]>();
  readonly modo = input<'resumen' | 'lista'>('lista');

  /** Se emite con la cita ya actualizada cuando el paciente cancela una. */
  readonly cancelada = output<Cita>();
  readonly irAReservar = output<void>();

  protected readonly cancelando = signal<number | null>(null);
  protected readonly error = signal('');

  protected readonly proximas = computed(() =>
    this.citas()
      .filter((c) => this.estaVigente(c))
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)),
  );

  protected readonly proxima = computed(() => this.proximas()[0] ?? null);

  protected readonly historial = computed(() =>
    this.citas()
      .filter((c) => !this.estaVigente(c))
      .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)),
  );

  protected readonly fecha = fechaLarga;
  protected readonly hora = hora;
  protected readonly relativa = relativa;

  /** Programada o confirmada y que todavía no empieza: se puede cancelar. */
  protected estaVigente(cita: Cita): boolean {
    return (
      (cita.estado === 'Programada' || cita.estado === 'Confirmada') &&
      new Date(cita.fechaInicio).getTime() > Date.now()
    );
  }

  protected claseEstado(cita: Cita): string {
    switch (cita.estado) {
      case 'Confirmada':
        return 'etiqueta--verde';
      case 'Cancelada':
        return 'etiqueta--roja';
      case 'Realizada':
        return 'etiqueta--gris';
      default:
        return 'etiqueta--azul';
    }
  }

  protected cancelar(cita: Cita): void {
    if (!confirm(`¿Cancelar tu cita con ${cita.psicologoNombre} del ${fechaLarga(cita.fechaInicio)}?`)) {
      return;
    }

    this.cancelando.set(cita.id);
    this.error.set('');

    this.citaService.cambiarEstado(cita.id, { estado: 'Cancelada' }).subscribe({
      next: (actualizada) => {
        this.cancelando.set(null);
        this.cancelada.emit(actualizada);
      },
      error: (err: HttpErrorResponse) => {
        this.cancelando.set(null);
        this.error.set(err.error?.mensaje ?? 'No se pudo cancelar la cita.');
      },
    });
  }
}
