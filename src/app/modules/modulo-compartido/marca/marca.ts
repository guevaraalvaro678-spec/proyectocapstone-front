import { Component, computed, inject, input } from '@angular/core';

import { SitioService } from '../../../core/services/sitio.service';

/** Marca de AMAAC Perú: el logo subido desde el panel o, si no hay, el ícono y el nombre. */
@Component({
  selector: 'app-marca',
  standalone: false,
  templateUrl: './marca.html',
  styleUrl: './marca.scss',
})
export class Marca {
  private readonly sitio = inject(SitioService);

  /** Texto blanco, para fondos oscuros. */
  readonly claro = input(false);

  /** Línea pequeña bajo el nombre (por ejemplo "Gestión institucional"). */
  readonly subtitulo = input('');

  protected readonly logoUrl = computed(() => this.sitio.sitio().logoUrl);
}
