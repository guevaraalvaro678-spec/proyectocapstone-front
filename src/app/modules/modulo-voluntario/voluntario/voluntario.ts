import { Component, computed, inject, signal } from '@angular/core';

import { Tarea, Voluntario as VoluntarioPerfil } from '../../../core/models/participante.model';
import { AuthService } from '../../../core/services/auth.service';
import { ParticipanteService } from '../../../core/services/participante.service';

/** Espacio del voluntario: sus datos y "Futuras tareas". Color verde oscuro para distinguirlo del practicante. */
@Component({
  selector: 'app-voluntario',
  standalone: false,
  templateUrl: './voluntario.html',
  styleUrl: './voluntario.scss',
})
export class Voluntario {
  private readonly participantes = inject(ParticipanteService);
  protected readonly auth = inject(AuthService);

  protected readonly perfil = signal<VoluntarioPerfil | null>(null);
  protected readonly tareas = signal<Tarea[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly pendientes = computed(() => this.tareas().filter((t) => t.estado === 'Pendiente'));
  protected readonly completadas = computed(() => this.tareas().filter((t) => t.estado === 'Completada'));

  constructor() {
    this.participantes.miPerfilVoluntario().subscribe({
      next: (perfil) => this.perfil.set(perfil),
      error: () => this.error.set('No se encontró tu perfil de voluntario.'),
    });
    this.cargarTareas();
  }

  protected alternar(t: Tarea): void {
    const nuevo = t.estado === 'Pendiente' ? 'Completada' : 'Pendiente';
    this.participantes.cambiarEstadoTarea(t.id, nuevo).subscribe(() => this.cargarTareas());
  }

  private cargarTareas(): void {
    this.participantes.misTareas().subscribe({
      next: (lista) => {
        this.tareas.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
