import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ETIQUETA_NOTICIA, EstadoNoticia, Noticia } from '../../../../core/models/donacion.model';
import { DonacionService } from '../../../../core/services/donacion.service';
import { SitioService } from '../../../../core/services/sitio.service';

/** Catálogo de noticias del sitio público: borradores, publicadas y no publicadas, con imagen opcional. */
@Component({
  selector: 'app-noticias',
  standalone: false,
  templateUrl: './noticias.html',
  styleUrl: './noticias.scss',
})
export class Noticias {
  private readonly donacionService = inject(DonacionService);
  private readonly sitioService = inject(SitioService);
  private readonly fb = inject(FormBuilder);

  protected readonly etiquetas = ETIQUETA_NOTICIA;
  protected readonly noticias = signal<Noticia[]>([]);
  protected readonly filtro = signal('');
  protected readonly buscar = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** null = cerrado; 0 = nueva; >0 = editando. */
  protected readonly editando = signal<number | null>(null);
  protected readonly imagenId = signal<number | null>(null);
  protected readonly imagenUrl = signal<string | null>(null);
  protected readonly subiendo = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorCajon = signal('');

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    resumen: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(400)]],
    contenido: ['', Validators.maxLength(4000)],
    estado: ['Borrador' as EstadoNoticia],
    fecha: [''],
  });

  protected readonly filtradas = computed(() => {
    const texto = this.buscar().trim().toLowerCase();
    return this.noticias().filter(
      (n) => (!this.filtro() || n.estado === this.filtro()) && (!texto || n.titulo.toLowerCase().includes(texto)),
    );
  });

  protected readonly indicadores = computed(() => {
    const lista = this.noticias();
    const contar = (e: EstadoNoticia) => lista.filter((n) => n.estado === e).length;
    return { borradores: contar('Borrador'), publicadas: contar('Publicada'), noPublicadas: contar('NoPublicada'), total: lista.length };
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.donacionService.listarNoticias().subscribe({
      next: (lista) => {
        this.noticias.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las noticias');
        this.cargando.set(false);
      },
    });
  }

  protected nueva(): void {
    this.form.reset({ titulo: '', resumen: '', contenido: '', estado: 'Borrador', fecha: new Date().toISOString().slice(0, 10) });
    this.imagenId.set(null);
    this.imagenUrl.set(null);
    this.errorCajon.set('');
    this.editando.set(0);
  }

  protected editar(n: Noticia): void {
    this.form.reset({
      titulo: n.titulo,
      resumen: n.resumen,
      contenido: n.contenido ?? '',
      estado: n.estado,
      fecha: n.fecha.slice(0, 10),
    });
    this.imagenId.set(n.imagenId);
    this.imagenUrl.set(n.imagenUrl);
    this.errorCajon.set('');
    this.editando.set(n.id);
  }

  protected elegirImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;

    this.subiendo.set(true);
    this.sitioService.subirImagen(archivo).subscribe({
      next: (img) => {
        this.imagenId.set(img.id);
        this.imagenUrl.set(img.url);
        this.subiendo.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.subiendo.set(false);
        this.errorCajon.set(err.error?.mensaje ?? 'No se pudo subir la imagen');
      },
    });
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos = {
      titulo: v.titulo,
      resumen: v.resumen,
      contenido: v.contenido || null,
      imagenId: this.imagenId(),
      estado: v.estado,
      fecha: v.fecha ? new Date(`${v.fecha}T12:00:00-05:00`).toISOString() : null,
    };
    const id = this.editando();
    const peticion = id ? this.donacionService.actualizarNoticia(id, datos) : this.donacionService.crearNoticia(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.editando.set(null);
        this.aviso.set(id ? 'Noticia actualizada.' : 'Noticia creada.');
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorCajon.set(err.error?.mensaje ?? 'No se pudo guardar la noticia');
      },
    });
  }

  protected eliminar(n: Noticia): void {
    if (!confirm(`¿Eliminar la noticia "${n.titulo}"?`)) return;
    this.donacionService.eliminarNoticia(n.id).subscribe({
      next: () => {
        this.aviso.set('Noticia eliminada.');
        this.cargar();
      },
      error: () => this.error.set('No se pudo eliminar la noticia'),
    });
  }
}
