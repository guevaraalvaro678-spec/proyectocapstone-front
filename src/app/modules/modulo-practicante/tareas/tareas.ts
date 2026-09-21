import { Component, inject, signal } from '@angular/core';

import { Tarea } from '../../../core/models/participante.model';
import { ParticipanteService } from '../../../core/services/participante.service';

/** Actividades que el administrador o Recursos Humanos le dejan al practicante (las urgentes son emergencias). */
@Component({
  selector: 'app-tareas',
  standalone: false,
  templateUrl: './tareas.html',
  styleUrl: './tareas.scss',
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
