import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

import { SitioService } from '../../../../core/services/sitio.service';

/** Configuración del sitio: por ahora, el logo que se muestra en la cabecera, el pie y los paneles. */
@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion {
  private readonly sitioService = inject(SitioService);

  protected readonly sitio = this.sitioService.sitio;
  protected readonly subiendo = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  constructor() {
    this.sitioService.cargar();
  }

  protected elegirLogo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;

    this.subiendo.set(true);
    this.error.set('');
    this.aviso.set('');
    this.sitioService.subirImagen(archivo).subscribe({
      next: (img) =>
        this.sitioService.guardarLogo(img.id).subscribe({
          next: () => this.listo('Logo actualizado.'),
          error: (err) => this.fallo(err),
        }),
      error: (err) => this.fallo(err),
    });
  }

  protected quitarLogo(): void {
    this.sitioService.guardarLogo(null).subscribe({
      next: () => this.listo('Logo quitado: se muestra el ícono de AMAAC.'),
      error: (err) => this.fallo(err),
    });
  }

  private listo(mensaje: string): void {
    this.subiendo.set(false);
    this.aviso.set(mensaje);
    this.sitioService.cargar();
  }

  private fallo(err: HttpErrorResponse): void {
    this.subiendo.set(false);
    this.error.set(err.error?.mensaje ?? 'No se pudo completar la acción');
  }
}
