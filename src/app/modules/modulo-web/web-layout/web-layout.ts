import { Component, inject } from '@angular/core';

import { SitioService } from '../../../core/services/sitio.service';

/** Marco del sitio público: cabecera, contenido de cada página y pie (los dos vienen del módulo compartido). */
@Component({
  selector: 'app-web-layout',
  standalone: false,
  templateUrl: './web-layout.html',
  styleUrl: './web-layout.scss',
})
export class WebLayout {
  constructor() {
    // Logo e iniciativas que muestran la cabecera y el inicio.
    inject(SitioService).cargar();
  }
}
