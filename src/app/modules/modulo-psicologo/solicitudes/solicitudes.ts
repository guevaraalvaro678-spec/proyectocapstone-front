import { Component, inject, signal } from '@angular/core';

import { Solicitud } from '../../../core/models/solicitud.model';
import { SolicitudService } from '../../../core/services/solicitud.service';
import { fechaHora } from '../../../core/utils/fechas';

/** Solicitudes de orientación abiertas que la administración le asignó al psicólogo. */
@Component({
  selector: 'app-solicitudes-psicologo',
  standalone: false,
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.scss',
})
export class Solicitudes {
  private readonly solicitudService = inject(SolicitudService);

  protected readonly solicitudes = signal<Solicitud[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly fechaHora = fechaHora;

  constructor() {
    this.solicitudService.listarAsignadas().subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes.');
        this.cargando.set(false);
      },
    });
  }
}
