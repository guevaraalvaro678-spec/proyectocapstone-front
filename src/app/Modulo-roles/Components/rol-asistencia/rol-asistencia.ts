import { Component, inject, signal } from '@angular/core';

import { Marcacion } from '../../../Modulo-compartido/Models/participante.model';
import { ParticipanteService } from '../../../Modulo-compartido/Services/participante.service';

/** Asistencia de los practicantes: lo que ellos marcan (entrada y salida) se ve aquí. */
@Component({
  selector: 'app-asistencia',
  standalone: false,
  templateUrl: './rol-asistencia.html',
})
export class Asistencia {
  private readonly participantes = inject(ParticipanteService);

  protected readonly marcaciones = signal<Marcacion[]>([]);
  protected readonly soloHoy = signal(true);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.cargar();
  }

  protected cambiarRango(valor: string): void {
    this.soloHoy.set(valor === 'hoy');
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.participantes.listarAsistencia(this.soloHoy()).subscribe({
      next: (lista) => {
        this.marcaciones.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la asistencia');
        this.cargando.set(false);
      },
    });
  }
}
