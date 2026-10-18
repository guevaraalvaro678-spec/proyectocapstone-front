import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { urlServidor } from '../../../../core/config/api.config';
import { Evento, EventoGuardar, MODALIDADES_EVENTO, ModalidadEvento, TipoEvento } from '../../../../core/models/evento.model';
import { EventoService } from '../../../../core/services/evento.service';
import { SitioService } from '../../../../core/services/sitio.service';

/** Convierte una fecha ISO (UTC) al formato local que espera <input type="datetime-local">. */
function aInputLocal(iso: string): string {
  const d = new Date(iso);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

/** Campañas y eventos: lo que se muestra en el inicio (portada, "Nuestras campañas" y "Próximos eventos"). */
@Component({
  selector: 'app-eventos',
  standalone: false,
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss',
})
export class Eventos {
  private readonly fb = inject(FormBuilder);
  private readonly eventoService = inject(EventoService);
  private readonly sitioService = inject(SitioService);

  protected readonly modalidades = MODALIDADES_EVENTO;
  protected readonly url = urlServidor;

  protected readonly eventos = signal<Evento[]>([]);
  protected readonly filtroTipo = signal('');
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly subiendo = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** null = formulario cerrado; 0 = nuevo; otro número = editando. */
  protected readonly editandoId = signal<number | null>(null);
  protected readonly formularioAbierto = computed(() => this.editandoId() !== null);

  protected readonly filtrados = computed(() =>
    this.filtroTipo() ? this.eventos().filter((e) => e.tipo === this.filtroTipo()) : this.eventos(),
  );
  protected readonly publicados = computed(() => this.eventos().filter((e) => e.publicado).length);

  protected readonly form = this.fb.nonNullable.group({
    tipo: ['Campana' as TipoEvento],
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(600)]],
    fechaInicio: ['', Validators.required],
    lugar: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    modalidad: ['Presencial' as ModalidadEvento, Validators.required],
    imagenUrl: ['', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/\S+|\/api\/imagen\/\d+)$/)]],
    publicado: [true],
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.eventoService.listarTodos().subscribe({
      next: (eventos) => {
        this.eventos.set(eventos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las campañas y eventos.');
        this.cargando.set(false);
      },
    });
  }

  protected nuevo(tipo: TipoEvento): void {
    this.aviso.set('');
    this.error.set('');
    this.form.reset({ tipo, titulo: '', descripcion: '', fechaInicio: '', lugar: '', modalidad: 'Presencial', imagenUrl: '', publicado: true });
    this.editandoId.set(0);
  }

  protected editar(evento: Evento): void {
    this.aviso.set('');
    this.error.set('');
    this.form.reset({
      tipo: evento.tipo,
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

  /** Sube la imagen al servidor y guarda su ruta en el formulario. */
  protected elegirImagen(e: Event): void {
    const input = e.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;

    this.subiendo.set(true);
    this.sitioService.subirImagen(archivo).subscribe({
      next: (img) => {
        this.subiendo.set(false);
        this.form.patchValue({ imagenUrl: img.ruta });
      },
      error: (err: HttpErrorResponse) => {
        this.subiendo.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo subir la imagen');
      },
    });
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos: EventoGuardar = {
      titulo: v.titulo,
      descripcion: v.descripcion,
      // El input trae la hora local; el backend la guarda en UTC.
      fechaInicio: new Date(v.fechaInicio).toISOString(),
      lugar: v.lugar,
      modalidad: v.modalidad,
      imagenUrl: v.imagenUrl.trim() || null,
      publicado: v.publicado,
      tipo: v.tipo,
    };

    const id = this.editandoId();
    const peticion = id ? this.eventoService.actualizar(id, datos) : this.eventoService.crear(datos);

    this.guardando.set(true);
    this.error.set('');
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.editandoId.set(null);
        this.aviso.set(id ? 'Cambios guardados.' : v.tipo === 'Campana' ? 'Campaña creada.' : 'Evento creado.');
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje ?? (err.status === 400 ? 'Revisa los datos.' : 'No se pudo guardar.'));
      },
    });
  }

  /** Publica u oculta sin abrir el formulario. */
  protected alternarPublicado(evento: Evento): void {
    this.eventoService
      .actualizar(evento.id, {
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        fechaInicio: evento.fechaInicio,
        lugar: evento.lugar,
        modalidad: evento.modalidad,
        imagenUrl: evento.imagenUrl,
        publicado: !evento.publicado,
        tipo: evento.tipo,
      })
      .subscribe({
        next: (actualizado) => this.eventos.update((lista) => lista.map((e) => (e.id === actualizado.id ? actualizado : e))),
        error: () => this.error.set('No se pudo cambiar la visibilidad.'),
      });
  }

  protected eliminar(evento: Evento): void {
    if (!confirm(`¿Eliminar "${evento.titulo}"? Esta acción no se puede deshacer.`)) return;

    this.eventoService.eliminar(evento.id).subscribe({
      next: () => {
        this.eventos.update((lista) => lista.filter((e) => e.id !== evento.id));
        this.aviso.set('Eliminado.');
      },
      error: () => this.error.set('No se pudo eliminar.'),
    });
  }

  protected yaPaso(evento: Evento): boolean {
    return new Date(evento.fechaInicio).getTime() < Date.now();
  }
}
