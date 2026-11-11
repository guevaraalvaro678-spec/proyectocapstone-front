import { Component, inject } from '@angular/core';

import { TemaService } from '../../Services/tema.service';

/** Botón para cambiar entre modo claro y oscuro. Va en las cabeceras del sitio, los portales y el panel. */
@Component({
  selector: 'app-boton-tema',
  standalone: false,
  templateUrl: './com-boton-tema.html',
  styleUrl: './com-boton-tema.scss',
})
export class BotonTema {
  protected readonly tema = inject(TemaService);
}
