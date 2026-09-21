import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Practicante, Tarea, Voluntario } from '../../../../core/models/participante.model';
import { ParticipanteService } from '../../../../core/services/participante.service';

interface Persona {
  usuarioId: number;
  etiqueta: string;
}

/** Actividades que se dejan a voluntarios y practicantes (con la marca de urgente para emergencias). */
@Component({
  selector: 'app-tareas',
  standalone: false,
  templateUrl: './tareas.html',
})
export class Tareas {
  private readonly participantes = inject(ParticipanteService);
  private readonly fb = inject(FormBuilder);

  protected readonly tareas = signal<Tarea[]>([]);
  protected readonly personas = signal<Persona[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  protected readonly form = this.fb.nonNullable.group({
    usuarioId: [0, [Validators.required, Validators.min(1)]],
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    descripcion: ['', Validators.maxLength(1000)],
    fechaLimite: [''],
    urgente: [false],
  });

  constructor() {
    this.participantes.listarVoluntarios().subscribe((lista: Voluntario[]) =>
      this.agregarPersonas(lista.filter((v) => v.activo).map((v) => ({ usuarioId: v.usuarioId, etiqueta: `${v.nombre} ${v.apellidos} (voluntario)` }))),
    );
    this.participantes.listarPracticantes().subscribe((lista: Practicante[]) =>
      this.agregarPersonas(lista.filter((p) => p.activo).map((p) => ({ usuarioId: p.usuarioId, etiqueta: `${p.nombre} ${p.apellidos} (practicante)` }))),
    );
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.participantes.listarTareas().subscribe({
      next: (lista) => {
        this.tareas.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las tareas');
        this.cargando.set(false);
      },
    });
  }

  protected crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { usuarioId, titulo, descripcion, fechaLimite, urgente } = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set('');
    this.aviso.set('');

    this.participantes
      .crearTarea({
        usuarioId: Number(usuarioId),
        titulo,
        descripcion: descripcion || undefined,
        fechaLimite: fechaLimite ? new Date(`${fechaLimite}T23:59:00-05:00`).toISOString() : undefined,
        urgente,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.aviso.set('Tarea asignada.');
          this.form.reset({ usuarioId: 0, titulo: '', descripcion: '', fechaLimite: '', urgente: false });
          this.cargar();
        },
        error: (err: HttpErrorResponse) => {
          this.guardando.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo crear la tarea');
        },
      });
  }

  private agregarPersonas(nuevas: Persona[]): void {
    this.personas.update((actuales) => [...actuales, ...nuevas]);
  }
}
