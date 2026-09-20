import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { Cita, EstadoCita, ESTADOS_CITA } from '../../../core/models/cita.model';
import { CitaService } from '../../../core/services/cita.service';
import { fechaLarga, hora } from '../../../core/utils/fechas';

type Filtro = 'proximas' | 'todas' | EstadoCita;

/** Las citas del psicólogo: las confirma, las marca como realizadas o canceladas y escribe sus notas privadas. */
@Component({
  selector: 'app-citas-psicologo',
  standalone: false,
  templateUrl: './citas.html',
  styleUrl: './citas.scss',
})
export class Citas {
  private readonly citaService = inject(CitaService);

  protected readonly estados = ESTADOS_CITA;

  protected readonly citas = signal<Cita[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');
  protected readonly filtro = signal<Filtro>('proximas');
  protected readonly trabajandoEn = signal<number | null>(null);

  /** Cita cuyas notas se están editando. */
  protected readonly notasDe = signal<Cita | null>(null);
  protected readonly notas = new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] });

  protected readonly visibles = computed(() => {
    const filtro = this.filtro();

    return this.citas()
      .filter((c) => {
        if (filtro === 'todas') return true;
        // "Próximas y por atender": las que vienen y las que ya empezaron sin haberse cerrado.
        if (filtro === 'proximas') return c.estado === 'Programada' || c.estado === 'Confirmada';
        return c.estado === filtro;
      })
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
  });

  protected readonly fecha = fechaLarga;
  protected readonly hora = hora;

  constructor() {
    this.citaService.listarMias().subscribe({
      next: (citas) => {
        this.citas.set(citas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus citas.');
        this.cargando.set(false);
      },
    });
  }

  protected cambiarFiltro(valor: string): void {
    this.filtro.set(valor as Filtro);
  }

  protected claseEstado(estado: EstadoCita): string {
    switch (estado) {
      case 'Confirmada':
        return 'ui-etiqueta--verde';
      case 'Cancelada':
        return 'ui-etiqueta--roja';
      case 'Realizada':
        return '';
      default:
        return 'ui-etiqueta--azul';
    }
  }

  protected puedeRealizar(cita: Cita): boolean {
    return cita.estado === 'Confirmada' && new Date(cita.fechaInicio).getTime() <= Date.now();
  }

  protected puedeCancelar(cita: Cita): boolean {
    return cita.estado === 'Programada' || cita.estado === 'Confirmada';
  }

  /** Las notas se guardan al confirmar o después de realizar la cita. */
  protected puedeNotas(cita: Cita): boolean {
    return cita.estado === 'Confirmada' || cita.estado === 'Realizada';
  }

  protected confirmar(cita: Cita): void {
    this.cambiar(cita, 'Confirmada', 'Cita confirmada.');
  }

  protected realizar(cita: Cita): void {
    this.cambiar(cita, 'Realizada', 'Cita marcada como realizada.');
  }

  protected cancelar(cita: Cita): void {
    if (!confirm(`¿Cancelar la cita con ${cita.pacienteNombre} del ${fechaLarga(cita.fechaInicio)}? Se le avisará por correo.`)) {
      return;
    }

    this.cambiar(cita, 'Cancelada', 'Cita cancelada.');
  }

  protected abrirNotas(cita: Cita): void {
    this.notasDe.set(cita);
    this.notas.setValue(cita.notas ?? '');
  }

  protected cerrarNotas(): void {
    this.notasDe.set(null);
  }

  protected guardarNotas(): void {
    const cita = this.notasDe();
    if (!cita || this.notas.invalid) return;

    // El estado se manda igual: solo cambian las notas.
    this.cambiar(cita, cita.estado, 'Notas guardadas.', this.notas.value, () => this.notasDe.set(null));
  }

  private cambiar(cita: Cita, estado: EstadoCita, mensaje: string, notas?: string, alTerminar?: () => void): void {
    this.trabajandoEn.set(cita.id);
    this.error.set('');
    this.aviso.set('');

    this.citaService.cambiarEstado(cita.id, { estado, notas }).subscribe({
      next: (actualizada) => {
        this.citas.update((lista) => lista.map((c) => (c.id === actualizada.id ? actualizada : c)));
        this.trabajandoEn.set(null);
        this.aviso.set(mensaje);
        alTerminar?.();
      },
      error: (err: HttpErrorResponse) => {
        this.trabajandoEn.set(null);
        this.error.set(err.error?.mensaje ?? 'No se pudo actualizar la cita.');
      },
    });
  }
}
