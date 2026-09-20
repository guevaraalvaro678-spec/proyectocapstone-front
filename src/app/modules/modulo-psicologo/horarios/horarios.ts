import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import {
  DIAS_SEMANA,
  Disponibilidad,
  DisponibilidadGuardar,
  ModalidadHorario,
  ORDEN_DIAS,
} from '../../../core/models/disponibilidad.model';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';

/** Convierte "HH:mm" en minutos desde medianoche. */
const aMinutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Los horarios que el psicólogo ofrece cada semana. Cada bloque se parte en citas consecutivas; esas
 * citas son las que ven los pacientes al reservar (menos las que ya estén ocupadas).
 */
@Component({
  selector: 'app-horarios-psicologo',
  standalone: false,
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss',
})
export class Horarios {
  private readonly fb = inject(FormBuilder);
  private readonly disponibilidadService = inject(DisponibilidadService);

  protected readonly diasSemana = DIAS_SEMANA;
  protected readonly ordenDias = ORDEN_DIAS;
  protected readonly duraciones = [30, 45, 50, 60, 90, 120];
  protected readonly modalidades: ModalidadHorario[] = ['Mixta', 'Presencial', 'Virtual'];

  protected readonly bloques = signal<Disponibilidad[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** null = formulario cerrado; 0 = bloque nuevo; otro número = editando ese bloque. */
  protected readonly editandoId = signal<number | null>(null);

  protected readonly porDia = computed(() =>
    ORDEN_DIAS.map((dia) => ({
      dia,
      nombre: DIAS_SEMANA[dia],
      bloques: this.bloques()
        .filter((b) => b.diaSemana === dia)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    })),
  );

  /** Cuántas citas por semana se ofrecen con los bloques activos. */
  protected readonly citasPorSemana = computed(() =>
    this.bloques()
      .filter((b) => b.activo)
      .reduce((total, b) => total + Math.floor((aMinutos(b.horaFin) - aMinutos(b.horaInicio)) / b.duracionMinutos), 0),
  );

  protected readonly form = this.fb.nonNullable.group({
    diaSemana: [1, Validators.required],
    horaInicio: ['09:00', Validators.required],
    horaFin: ['13:00', Validators.required],
    duracionMinutos: [60, Validators.required],
    modalidad: ['Mixta' as ModalidadHorario, Validators.required],
    lugar: ['', Validators.maxLength(200)],
    activo: [true],
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);

    this.disponibilidadService.listarMia().subscribe({
      next: (bloques) => {
        this.bloques.set(bloques);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus horarios.');
        this.cargando.set(false);
      },
    });
  }

  protected nuevo(): void {
    this.limpiarMensajes();
    this.form.reset({ diaSemana: 1, horaInicio: '09:00', horaFin: '13:00', duracionMinutos: 60, modalidad: 'Mixta', lugar: '', activo: true });
    this.editandoId.set(0);
  }

  protected editar(bloque: Disponibilidad): void {
    this.limpiarMensajes();
    this.form.reset({
      diaSemana: bloque.diaSemana,
      horaInicio: bloque.horaInicio,
      horaFin: bloque.horaFin,
      duracionMinutos: bloque.duracionMinutos,
      modalidad: bloque.modalidad,
      lugar: bloque.lugar ?? '',
      activo: bloque.activo,
    });
    this.editandoId.set(bloque.id);
  }

  protected cancelar(): void {
    this.editandoId.set(null);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();

    if (aMinutos(valores.horaFin) <= aMinutos(valores.horaInicio)) {
      this.error.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }

    const datos: DisponibilidadGuardar = { ...valores, lugar: valores.lugar.trim() || null };
    const id = this.editandoId();

    this.guardando.set(true);
    this.limpiarMensajes();

    (id ? this.disponibilidadService.actualizar(id, datos) : this.disponibilidadService.crear(datos)).subscribe({
      next: () => {
        this.guardando.set(false);
        this.editandoId.set(null);
        this.aviso.set(id ? 'Horario actualizado.' : 'Horario agregado. Los pacientes ya pueden reservarlo.');
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo guardar el horario. Revisa los datos.');
      },
    });
  }

  /** Activa o desactiva un bloque sin borrarlo. */
  protected alternarActivo(bloque: Disponibilidad): void {
    this.limpiarMensajes();

    const { id, psicologoId, ...datos } = bloque;
    this.disponibilidadService.actualizar(id, { ...datos, activo: !bloque.activo }).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(err.error?.mensaje ?? 'No se pudo cambiar el horario.'),
    });
  }

  protected eliminar(bloque: Disponibilidad): void {
    if (!confirm('¿Eliminar este bloque de horario? Las citas ya reservadas no se cancelan.')) return;

    this.limpiarMensajes();

    this.disponibilidadService.eliminar(bloque.id).subscribe({
      next: () => {
        this.aviso.set('Horario eliminado.');
        this.cargar();
      },
      error: () => this.error.set('No se pudo eliminar el horario.'),
    });
  }

  private limpiarMensajes(): void {
    this.error.set('');
    this.aviso.set('');
  }
}
