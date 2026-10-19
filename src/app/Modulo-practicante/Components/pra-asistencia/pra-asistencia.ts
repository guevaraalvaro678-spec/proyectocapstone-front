import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';

import { Marcacion } from '../../../Modulo-compartido/Models/participante.model';
import { ParticipanteService } from '../../../Modulo-compartido/Services/participante.service';

/** El practicante marca su entrada y su salida; el administrador lo ve en su panel de asistencia. */
@Component({
  selector: 'app-asistencia',
  standalone: false,
  templateUrl: './pra-asistencia.html',
})
export class Asistencia {
  private readonly participantes = inject(ParticipanteService);

  protected readonly marcaciones = signal<Marcacion[]>([]);
  protected readonly trabajando = signal(false);
  protected readonly error = signal('');

  /** Hay una entrada sin salida: el practicante está "dentro". */
  protected readonly enCurso = computed(() => this.marcaciones().find((m) => !m.salida) ?? null);

  constructor() {
    this.cargar();
  }

  protected marcarEntrada(): void {
    this.ejecutar(this.participantes.marcarEntrada());
  }

  protected marcarSalida(): void {
    this.ejecutar(this.participantes.marcarSalida());
  }

  private ejecutar(peticion: ReturnType<ParticipanteService['marcarEntrada']>): void {
    this.trabajando.set(true);
    this.error.set('');

    peticion.subscribe({
      next: () => {
        this.trabajando.set(false);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.trabajando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo registrar la marcación');
        this.cargar();
      },
    });
  }

  private cargar(): void {
    this.participantes.misMarcaciones().subscribe((lista) => this.marcaciones.set(lista));
  }
}
