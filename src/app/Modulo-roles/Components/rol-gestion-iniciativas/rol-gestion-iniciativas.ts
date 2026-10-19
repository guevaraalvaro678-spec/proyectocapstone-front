import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { COLORES_INICIATIVA, EstadoIniciativa, Iniciativa } from '../../../Modulo-compartido/Models/sitio.model';
import { SitioService } from '../../../Modulo-compartido/Services/sitio.service';

/**
 * Iniciativas: el equipo revisa las que proponen voluntarios y practicantes (aprobar o rechazar)
 * y crea o edita las que se muestran en el sitio público.
 */
@Component({
  selector: 'app-gestion-iniciativas',
  standalone: false,
  templateUrl: './rol-gestion-iniciativas.html',
  styleUrl: './rol-gestion-iniciativas.scss',
})
export class GestionIniciativas {
  private readonly sitioService = inject(SitioService);
  private readonly fb = inject(FormBuilder);

  protected readonly colores = COLORES_INICIATIVA;
  protected readonly etiquetas: Record<EstadoIniciativa, string> = {
    Pendiente: 'Pendiente de revisión',
    Aprobada: 'Aprobada',
    Rechazada: 'Rechazada',
  };

  protected readonly iniciativas = signal<Iniciativa[]>([]);
  protected readonly pestana = signal<'todas' | 'revision'>('todas');
  protected readonly filtroEstado = signal('');
  protected readonly buscar = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** null = cerrado; 0 = nueva; >0 = editando/revisando. */
  protected readonly editando = signal<number | null>(null);
  protected readonly actual = signal<Iniciativa | null>(null);
  protected readonly motivo = signal('');
  protected readonly imagenId = signal<number | null>(null);
  protected readonly imagenUrl = signal<string | null>(null);
  protected readonly subiendo = signal(false);
  protected readonly trabajando = signal(false);
  protected readonly errorCajon = signal('');

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    texto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(600)]],
    icono: ['⭐', Validators.maxLength(10)],
    color: ['verde' as Iniciativa['color']],
    orden: [0],
    activa: [true],
  });

  protected readonly indicadores = computed(() => {
    const lista = this.iniciativas();
    const contar = (e: EstadoIniciativa) => lista.filter((i) => i.estado === e).length;
    return { pendientes: contar('Pendiente'), aprobadas: contar('Aprobada'), rechazadas: contar('Rechazada') };
  });

  protected readonly filtradas = computed(() => {
    const texto = this.buscar().trim().toLowerCase();
    return this.iniciativas().filter(
      (i) =>
        (this.pestana() === 'todas' || i.estado === 'Pendiente') &&
        (!this.filtroEstado() || i.estado === this.filtroEstado()) &&
        (!texto || `${i.titulo} ${i.creadaPorNombre ?? ''}`.toLowerCase().includes(texto)),
    );
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.sitioService.listarIniciativas().subscribe({
      next: (lista) => {
        this.iniciativas.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las iniciativas');
        this.cargando.set(false);
      },
    });
  }

  protected nueva(): void {
    this.actual.set(null);
    this.form.reset({ titulo: '', texto: '', icono: '⭐', color: 'verde', orden: this.iniciativas().length + 1, activa: true });
    this.imagenId.set(null);
    this.imagenUrl.set(null);
    this.errorCajon.set('');
    this.editando.set(0);
  }

  protected abrir(i: Iniciativa): void {
    this.actual.set(i);
    this.motivo.set('');
    this.form.reset({ titulo: i.titulo, texto: i.texto, icono: i.icono, color: i.color, orden: i.orden, activa: i.activa });
    this.imagenId.set(i.imagenId);
    this.imagenUrl.set(i.imagenUrl);
    this.errorCajon.set('');
    this.editando.set(i.id);
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

    const datos = { ...this.form.getRawValue(), imagenId: this.imagenId() };
    const id = this.editando();
    const peticion = id ? this.sitioService.actualizarIniciativa(id, datos) : this.sitioService.crearIniciativa(datos);

    this.trabajando.set(true);
    peticion.subscribe({
      next: () => this.terminar(id ? 'Iniciativa actualizada.' : 'Iniciativa creada.'),
      error: (err: HttpErrorResponse) => this.fallo(err),
    });
  }

  protected revisar(estado: 'Aprobada' | 'Rechazada'): void {
    const i = this.actual();
    if (!i) return;

    this.trabajando.set(true);
    this.sitioService.revisarIniciativa(i.id, estado, this.motivo()).subscribe({
      next: () => this.terminar(estado === 'Aprobada' ? 'Iniciativa aprobada: ya se ve en el sitio.' : 'Iniciativa rechazada.'),
      error: (err: HttpErrorResponse) => this.fallo(err),
    });
  }

  protected eliminar(): void {
    const i = this.actual();
    if (!i || !confirm(`¿Eliminar la iniciativa "${i.titulo}"?`)) return;

    this.sitioService.eliminarIniciativa(i.id).subscribe({
      next: () => this.terminar('Iniciativa eliminada.'),
      error: (err: HttpErrorResponse) => this.fallo(err),
    });
  }

  private terminar(mensaje: string): void {
    this.trabajando.set(false);
    this.editando.set(null);
    this.aviso.set(mensaje);
    this.cargar();
    this.sitioService.cargar();
  }

  private fallo(err: HttpErrorResponse): void {
    this.trabajando.set(false);
    this.errorCajon.set(err.error?.mensaje ?? 'No se pudo completar la acción');
  }
}
