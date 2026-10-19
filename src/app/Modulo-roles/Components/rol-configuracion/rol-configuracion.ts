import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { SitioService } from '../../../Modulo-compartido/Services/sitio.service';

/** Configuración del sitio: el logo (cabecera, pie y paneles) y los datos de Yape para donar dinero. */
@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './rol-configuracion.html',
  styleUrl: './rol-configuracion.scss',
})
export class Configuracion {
  private readonly sitioService = inject(SitioService);

  protected readonly sitio = this.sitioService.sitio;
  protected readonly subiendo = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  // ---- Yape ----
  protected readonly formYape = inject(FormBuilder).nonNullable.group({ numero: [''], titular: [''] });
  protected readonly qrId = signal<number | null>(null);
  protected readonly qrVista = signal<string | null>(null);
  protected readonly guardandoYape = signal(false);

  constructor() {
    this.sitioService.cargar();

    // Al cargar la configuración, el formulario muestra lo que está guardado.
    effect(() => {
      const yape = this.sitio().yape;
      untracked(() => {
        this.formYape.setValue({ numero: yape?.numero ?? '', titular: yape?.titular ?? '' });
        this.qrId.set(yape?.qrImagenId ?? null);
        this.qrVista.set(yape?.qrUrl ?? null);
      });
    });
  }

  protected elegirQr(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;

    this.guardandoYape.set(true);
    this.error.set('');
    this.sitioService.subirImagen(archivo).subscribe({
      next: (img) => {
        this.guardandoYape.set(false);
        this.qrId.set(img.id);
        this.qrVista.set(img.url);
      },
      error: (err) => this.fallo(err),
    });
  }

  protected quitarQr(): void {
    this.qrId.set(null);
    this.qrVista.set(null);
  }

  /** El backend valida el número (9 dígitos que empiezan con 9) y guarda todo junto. */
  protected guardarYape(): void {
    const v = this.formYape.getRawValue();
    this.enviarYape(v.numero.trim() || null, v.titular.trim() || null, this.qrId(), 'Datos de Yape guardados: ya se ven en la página Donar.');
  }

  protected quitarYape(): void {
    this.enviarYape(null, null, null, 'Yape quitado: la página Donar ya no muestra la sección.');
  }

  private enviarYape(numero: string | null, titular: string | null, qrImagenId: number | null, mensaje: string): void {
    this.guardandoYape.set(true);
    this.error.set('');
    this.aviso.set('');
    this.sitioService.guardarYape({ numero, titular, qrImagenId }).subscribe({
      next: () => {
        this.guardandoYape.set(false);
        this.listo(mensaje);
      },
      error: (err) => {
        this.guardandoYape.set(false);
        this.fallo(err);
      },
    });
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
    this.guardandoYape.set(false);
    // Los errores de validación del backend llegan como { errors: { Campo: [mensaje] } }.
    const validacion = err.error?.errors ? Object.values(err.error.errors as Record<string, string[]>)[0]?.[0] : null;
    this.error.set(err.error?.mensaje ?? validacion ?? 'No se pudo completar la acción');
  }
}
