import { Component, inject, signal } from '@angular/core';

import { Tarea } from '../../../Modulo-compartido/Models/participante.model';
import { ParticipanteService } from '../../../Modulo-compartido/Services/participante.service';

/** Actividades que el administrador o Recursos Humanos le dejan al practicante (las urgentes son emergencias). */
@Component({
  selector: 'app-tareas',
  standalone: false,
  templateUrl: './pra-tareas.html',
  styleUrl: './pra-tareas.scss',
})
export class Tareas {
  private readonly participantes = inject(ParticipanteService);

  protected readonly tareas = signal<Tarea[]>([]);
  protected readonly cargando = signal(true);

  constructor() {
    this.cargar();
  }

  protected alternar(t: Tarea): void {
    const nuevo = t.estado === 'Pendiente' ? 'Completada' : 'Pendiente';
    this.participantes.cambiarEstadoTarea(t.id, nuevo).subscribe(() => this.cargar());
  }

  private cargar(): void {
    this.participantes.misTareas().subscribe({
      next: (lista) => {
        this.tareas.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
