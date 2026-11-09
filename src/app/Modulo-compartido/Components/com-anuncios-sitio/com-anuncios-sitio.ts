import { Component, inject, signal } from '@angular/core';

import { Anuncio } from '../../Models/anuncio.model';
import { AnuncioService } from '../../Services/anuncio.service';

/** Franja de anuncios vigentes sobre la cabecera del sitio público. El visitante puede cerrarla. */
@Component({
  selector: 'app-anuncios-sitio',
  standalone: false,
  templateUrl: './com-anuncios-sitio.html',
  styleUrl: './com-anuncios-sitio.scss',
})
export class AnunciosSitio {
  protected readonly anuncios = signal<Anuncio[]>([]);

  constructor() {
    inject(AnuncioService).vigentes().subscribe({ next: (l) => this.anuncios.set(l), error: () => this.anuncios.set([]) });
  }

  protected cerrar(id: number): void {
    this.anuncios.update((l) => l.filter((a) => a.id !== id));
  }
}
