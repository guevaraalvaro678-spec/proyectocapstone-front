import { Component, inject } from '@angular/core';

import { SitioService } from '../../../Modulo-compartido/Services/sitio.service';

/** Marco del sitio público: cabecera, contenido de cada página y pie (los dos vienen del módulo compartido). */
@Component({
  selector: 'app-web-layout',
  standalone: false,
  templateUrl: './web-layout.html',
  styleUrl: './web-layout.scss',
})
export class WebLayout {
  /** Número de WhatsApp de la ONG (código de país + número, sin espacios). Reemplazar por el real. */
  protected readonly enlaceWhatsapp =
    'https://wa.me/51999999999?text=' + encodeURIComponent('Hola AMAAC Perú, quisiera más información.');

  constructor() {
    // Logo e iniciativas que muestran la cabecera y el inicio.
    inject(SitioService).cargar();
  }
}
