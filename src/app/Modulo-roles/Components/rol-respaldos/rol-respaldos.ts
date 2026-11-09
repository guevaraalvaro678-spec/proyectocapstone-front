import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

import { RespaldoEstado } from '../../Models/panel.model';
import { PanelService } from '../../Services/panel.service';

/** Copias de seguridad de la base: automáticas cada cierto tiempo y "Respaldar ahora". Va dentro de Configuración. */
@Component({
  selector: 'app-respaldos',
  standalone: false,
  templateUrl: './rol-respaldos.html',
  styleUrl: './rol-respaldos.scss',
})
export class Respaldos {
  private readonly panel = inject(PanelService);

  protected readonly estado = signal<RespaldoEstado | null>(null);
  protected readonly trabajando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  constructor() {
    this.cargar();
  }

  protected respaldar(): void {
    this.trabajando.set(true);
    this.error.set('');
    this.panel.respaldar().subscribe({
      next: (r) => {
        this.trabajando.set(false);
        this.aviso.set(`Copia creada: ${r.nombre}`);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.trabajando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo crear la copia');
      },
    });
  }

  private cargar(): void {
    this.panel.respaldos().subscribe({
      next: (e) => this.estado.set(e),
      error: () => this.error.set('No se pudo consultar las copias de seguridad'),
    });
  }
}
