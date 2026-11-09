import { Component, inject, signal } from '@angular/core';

import { AuthService } from '../../../Modulo-compartido/Services/auth.service';
import { BandejaRrhh } from '../../Models/panel.model';
import { PanelService } from '../../Services/panel.service';

/**
 * Bandeja de trabajo de Recursos Humanos: lo que espera una acción hoy (postulaciones por revisar, agendar o decidir,
 * sesiones por cerrar, horarios por revisar y actividades vencidas). Cada bloque lleva a la pantalla donde se resuelve.
 */
@Component({
  selector: 'app-bandeja',
  standalone: false,
  templateUrl: './rol-bandeja.html',
  styleUrl: './rol-bandeja.scss',
})
export class Bandeja {
  private readonly panel = inject(PanelService);
  protected readonly auth = inject(AuthService);

  protected readonly datos = signal<BandejaRrhh | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.panel.bandeja().subscribe({
      next: (d) => {
        this.datos.set(d);
        this.error.set('');
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la bandeja');
        this.cargando.set(false);
      },
    });
  }
}
