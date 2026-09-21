import { Component, computed, inject } from '@angular/core';

import { SitioService } from '../../../core/services/sitio.service';

/** Iniciativas de la ONG: las edita el administrador desde su panel. */
@Component({
  selector: 'app-iniciativas',
  standalone: false,
  templateUrl: './iniciativas.html',
  styleUrl: './iniciativas.scss',
})
export class Iniciativas {
  private readonly sitioService = inject(SitioService);
  protected readonly iniciativas = computed(() => this.sitioService.sitio().iniciativas);
}
