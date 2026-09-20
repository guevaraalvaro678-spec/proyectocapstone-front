import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Evento, EventoGuardar, MODALIDADES_EVENTO, ModalidadEvento } from '../../../../core/models/evento.model';
import { EventoService } from '../../../../core/services/evento.service';

/** Convierte una fecha ISO (UTC) al formato local que espera <input type="datetime-local">. */
function aInputLocal(iso: string): string {
  const d = new Date(iso);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

/** Módulo Eventos: el administrador controla lo que se muestra en el banner del sitio público. */
@Component({
  selector: 'app-eventos',
  standalone: false,
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss',
})
export class Eventos {
  private readonly fb = inject(FormBuilder);
  private readonly eventoService = inject(EventoService);

  protected readonly modalidades = MODALIDADES_EVENTO;

  protected readonly eventos = signal<Evento[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** null = formulario cerrado; 0 = evento nuevo; otro número = editando ese evento. */
  protected readonly editandoId = signal<number | null>(null);
  protected readonly formularioAbierto = computed(() => this.editandoId() !== null);

  protected readonly publicados = computed(() => this.eventos().filter((e) => e.publicado).length);

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(600)]],
    fechaInicio: ['', Validators.required],
    lugar: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    modalidad: ['Presencial' as ModalidadEvento, Validators.required],
    imagenUrl: ['', [Validators.maxLength(500), Validators.pattern(/^https?:\/\/\S+$/)]],
    publicado: [true],
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.eventoService.listarTodos().subscribe({
      next: (eventos) => {
        this.eventos.set(eventos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los eventos.');
        this.cargando.set(false);
      },
    });
  }

  protected nuevo(): void {
    this.aviso.set('');
    this.error.set('');
    this.form.reset({
      titulo: '',
      descripcion: '',
      fechaInicio: '',
      lugar: '',
      modalidad: 'Presencial',
      imagenUrl: '',
      publicado: true,
    });
    this.editandoId.set(0);
  }

  protected editar(evento: Evento): void {
    this.aviso.set('');
    this.error.set('');
    this.form.reset({
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fechaInicio: aInputLocal(evento.fechaInicio),
      lugar: evento.lugar,
      modalidad: evento.modalidad,
      imagenUrl: evento.imagenUrl ?? '',
      publicado: evento.publicado,
    });
    this.editandoId.set(evento.id);
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
    const datos: EventoGuardar = {
      titulo: valores.titulo,
      descripcion: valores.descripcion,
      // El input trae la hora local; el backend la guarda en UTC.
      fechaInicio: new Date(valores.fechaInicio).toISOString(),
      lugar: valores.lugar,
      modalidad: valores.modalidad,
      imagenUrl: valores.imagenUrl.trim() || null,
      publicado: valores.publicado,
    };

    const id = this.editandoId();
    const peticion = id ? this.eventoService.actualizar(id, datos) : this.eventoService.crear(datos);

    this.guardando.set(true);
    this.error.set('');
    this.aviso.set('');

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.editandoId.set(null);
        this.aviso.set(id ? 'Evento actualizado.' : 'Evento creado.');
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(
          err.status === 400 ? 'Revisa los datos del evento.' : 'No se pudo guardar el evento.',
        );
      },
    });
  }

  /** Publica u oculta un evento sin abrir el formulario. */
  protected alternarPublicado(evento: Evento): void {
    this.error.set('');
    this.aviso.set('');

    this.eventoService
      .actualizar(evento.id, {
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        fechaInicio: evento.fechaInicio,
        lugar: evento.lugar,
        modalidad: evento.modalidad,
        imagenUrl: evento.imagenUrl,
        publicado: !evento.publicado,
      })
      .subscribe({
        next: (actualizado) =>
          this.eventos.update((lista) => lista.map((e) => (e.id === actualizado.id ? actualizado : e))),
        error: () => this.error.set('No se pudo cambiar la visibilidad del evento.'),
      });
  }

  protected eliminar(evento: Evento): void {
    if (!confirm(`¿Eliminar el evento "${evento.titulo}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.error.set('');
    this.aviso.set('');

    this.eventoService.eliminar(evento.id).subscribe({
      next: () => {
        this.eventos.update((lista) => lista.filter((e) => e.id !== evento.id));
        this.aviso.set('Evento eliminado.');
      },
      error: () => this.error.set('No se pudo eliminar el evento.'),
    });
  }

  protected yaPaso(evento: Evento): boolean {
    return new Date(evento.fechaInicio).getTime() < Date.now();
  }
}
