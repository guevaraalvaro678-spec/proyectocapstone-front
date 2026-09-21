import { Component, inject, signal } from '@angular/core';

import { ETIQUETA_HORARIO, Practicante } from '../../../core/models/participante.model';
import { ParticipanteService } from '../../../core/services/participante.service';

/** Información del practicante: datos personales, académicos y el estado de su horario. */
@Component({
  selector: 'app-datos',
  standalone: false,
  templateUrl: './datos.html',
})
export class Datos {
  private readonly participantes = inject(ParticipanteService);

  protected readonly etiquetas = ETIQUETA_HORARIO;
  protected readonly perfil = signal<Practicante | null>(null);
  protected readonly error = signal('');

  constructor() {
    this.participantes.miPerfilPracticante().subscribe({
      next: (p) => this.perfil.set(p),
      error: () => this.error.set('No se pudo cargar tu información'),
    });
  }
}
