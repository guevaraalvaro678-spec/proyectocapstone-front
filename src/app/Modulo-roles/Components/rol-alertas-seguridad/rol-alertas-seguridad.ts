import { Component, inject, signal } from '@angular/core';

import { AlertasResumen } from '../../Models/panel.model';
import { PanelService } from '../../Services/panel.service';

/** Alertas de actividad inusual (intentos fallidos, cuentas bloqueadas) pendientes de revisar. Va en el dashboard. */
@Component({
  selector: 'app-alertas-seguridad',
  standalone: false,
  templateUrl: './rol-alertas-seguridad.html',
  styleUrl: './rol-alertas-seguridad.scss',
})
export class AlertasSeguridadPanel {
  private readonly panel = inject(PanelService);

  protected readonly datos = signal<AlertasResumen | null>(null);
  protected readonly trabajando = signal(false);

  constructor() {
    this.cargar();
  }

  protected revisar(id: number): void {
    this.trabajando.set(true);
    this.panel.marcarRevisada(id).subscribe({ next: () => this.cargar(), error: () => this.trabajando.set(false) });
  }

  protected revisarTodas(): void {
    this.trabajando.set(true);
    this.panel.marcarTodasRevisadas().subscribe({ next: () => this.cargar(), error: () => this.trabajando.set(false) });
  }

  private cargar(): void {
    this.panel.alertas(true).subscribe({
      next: (d) => {
        this.datos.set(d);
        this.trabajando.set(false);
      },
      error: () => this.trabajando.set(false),
    });
  }
}
