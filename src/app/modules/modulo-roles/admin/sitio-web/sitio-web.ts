import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { COLORES_INICIATIVA, Iniciativa } from '../../../../core/models/sitio.model';
import { SitioService } from '../../../../core/services/sitio.service';

/** Edita el sitio público: el logo y las iniciativas, subiendo las imágenes desde el equipo. */
@Component({
  selector: 'app-sitio-web',
  standalone: false,
  templateUrl: './sitio-web.html',
  styleUrl: './sitio-web.scss',
})
export class SitioWeb {
  private readonly sitioService = inject(SitioService);
  private readonly fb = inject(FormBuilder);

  protected readonly colores = COLORES_INICIATIVA;
  protected readonly sitio = this.sitioService.sitio;
  protected readonly iniciativas = signal<Iniciativa[]>([]);
  protected readonly cargando = signal(true);
  protected readonly subiendo = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** Iniciativa en edición; null = creando una nueva. */
  protected readonly editandoId = signal<number | null>(null);
  protected readonly imagenId = signal<number | null>(null);
  protected readonly imagenUrl = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    texto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(600)]],
    icono: ['⭐', Validators.maxLength(10)],
    color: ['rojo' as Iniciativa['color']],
    orden: [0],
    activa: [true],
  });

  constructor() {
    this.sitioService.cargar();
    this.cargar();
  }

  // ---- Logo ----

  protected elegirLogo(evento: Event): void {
    const archivo = this.archivoDe(evento);
    if (!archivo) return;

    this.subiendo.set(true);
    this.limpiarMensajes();

    this.sitioService.subirImagen(archivo).subscribe({
      next: (imagen) =>
        this.sitioService.guardarLogo(imagen.id).subscribe({
          next: () => this.terminarSubida('Logo actualizado.'),
          error: (err) => this.fallo(err),
        }),
      error: (err) => this.fallo(err),
    });
  }

  protected quitarLogo(): void {
    this.limpiarMensajes();
    this.sitioService.guardarLogo(null).subscribe({
      next: () => this.terminarSubida('Logo quitado: el sitio muestra el texto.'),
      error: (err) => this.fallo(err),
    });
  }

  // ---- Iniciativas ----

  protected editar(i: Iniciativa): void {
    this.editandoId.set(i.id);
    this.imagenId.set(i.imagenId);
    this.imagenUrl.set(i.imagenUrl);
    this.form.setValue({ titulo: i.titulo, texto: i.texto, icono: i.icono, color: i.color, orden: i.orden, activa: i.activa });
    this.limpiarMensajes();
  }

  protected nueva(): void {
    this.editandoId.set(null);
    this.imagenId.set(null);
    this.imagenUrl.set(null);
    this.form.reset({ titulo: '', texto: '', icono: '⭐', color: 'rojo', orden: this.iniciativas().length + 1, activa: true });
  }

  protected elegirImagen(evento: Event): void {
    const archivo = this.archivoDe(evento);
    if (!archivo) return;

    this.subiendo.set(true);
    this.limpiarMensajes();

    this.sitioService.subirImagen(archivo).subscribe({
      next: (imagen) => {
        this.imagenId.set(imagen.id);
        this.imagenUrl.set(imagen.url);
        this.subiendo.set(false);
      },
      error: (err) => this.fallo(err),
    });
  }

  protected quitarImagen(): void {
    this.imagenId.set(null);
    this.imagenUrl.set(null);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = { ...this.form.getRawValue(), imagenId: this.imagenId() };
    const id = this.editandoId();
    const peticion = id === null ? this.sitioService.crearIniciativa(datos) : this.sitioService.actualizarIniciativa(id, datos);

    this.limpiarMensajes();
    peticion.subscribe({
      next: () => {
        this.aviso.set(id === null ? 'Iniciativa creada.' : 'Iniciativa actualizada.');
        this.nueva();
        this.cargar();
        this.sitioService.cargar();
      },
      error: (err) => this.fallo(err),
    });
  }

  protected eliminar(i: Iniciativa): void {
    if (!confirm(`¿Eliminar la iniciativa "${i.titulo}"?`)) return;

    this.sitioService.eliminarIniciativa(i.id).subscribe({
      next: () => {
        this.aviso.set('Iniciativa eliminada.');
        if (this.editandoId() === i.id) this.nueva();
        this.cargar();
        this.sitioService.cargar();
      },
      error: (err) => this.fallo(err),
    });
  }

  private cargar(): void {
    this.sitioService.listarIniciativas().subscribe({
      next: (lista) => {
        this.iniciativas.set(lista);
        this.cargando.set(false);
        if (this.editandoId() === null) this.form.patchValue({ orden: lista.length + 1 });
      },
      error: () => {
        this.error.set('No se pudieron cargar las iniciativas');
        this.cargando.set(false);
      },
    });
  }

  private archivoDe(evento: Event): File | null {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    input.value = '';
    return archivo;
  }

  private terminarSubida(mensaje: string): void {
    this.subiendo.set(false);
    this.aviso.set(mensaje);
    this.sitioService.cargar();
  }

  private limpiarMensajes(): void {
    this.error.set('');
    this.aviso.set('');
  }

  private fallo(err: HttpErrorResponse): void {
    this.subiendo.set(false);
    this.error.set(err.error?.mensaje ?? 'No se pudo completar la acción');
  }
}
