import { Component, inject, signal } from '@angular/core';

import { IndicadoresProceso } from '../../Models/panel.model';
import { PanelService } from '../../Services/panel.service';

/** Indicadores del proceso de selección; los calcula la base con sp_IndicadoresProceso. Se usa en el dashboard y la bandeja. */
@Component({
  selector: 'app-indicadores-proceso',
  standalone: false,
  templateUrl: './rol-indicadores-proceso.html',
  styleUrl: './rol-indicadores-proceso.scss',
})
export class IndicadoresProcesoPanel {
  protected readonly datos = signal<IndicadoresProceso | null>(null);

  constructor() {
    inject(PanelService).indicadores().subscribe({ next: (d) => this.datos.set(d), error: () => this.datos.set(null) });
  }
}
