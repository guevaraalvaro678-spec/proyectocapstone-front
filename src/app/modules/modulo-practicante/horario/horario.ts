import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

import {
  BloqueHorario,
  DIAS_SEMANA,
  ETIQUETA_HORARIO,
  Practicante,
} from '../../../core/models/participante.model';
import { ParticipanteService } from '../../../core/services/participante.service';

/**
 * Horario del practicante: primero envía su horario de la universidad; Recursos Humanos lo revisa
 * (Pendiente, En revisión, Aceptado) y al aceptarlo se le muestra confirmado su horario de prácticas.
 */
@Component({
  selector: 'app-horario',
  standalone: false,
  templateUrl: './horario.html',
  styleUrl: './horario.scss',
})
export class Horario {
  private readonly participantes = inject(ParticipanteService);

  protected readonly dias = DIAS_SEMANA;
  protected readonly etiquetas = ETIQUETA_HORARIO;
  protected readonly perfil = signal<Practicante | null>(null);
  protected readonly bloques = signal<BloqueHorario[]>([]);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  constructor() {
    this.participantes.miPerfilPracticante().subscribe({
      next: (p) => this.aplicar(p),
      error: () => this.error.set('No se pudo cargar tu horario'),
    });
  }

  protected agregar(): void {
    this.bloques.update((b) => [...b, { diaSemana: 1, horaInicio: '08:00', horaFin: '10:00' }]);
  }

  protected quitar(indice: number): void {
    this.bloques.update((b) => b.filter((_, i) => i !== indice));
  }

  protected editar(indice: number, campo: keyof BloqueHorario, valor: string): void {
    this.bloques.update((b) =>
      b.map((bloque, i) =>
        i === indice ? { ...bloque, [campo]: campo === 'diaSemana' ? Number(valor) : valor } : bloque,
      ),
    );
  }

  protected horasPracticas(p: Practicante): number {
    return p.horarioPracticas.reduce((s, b) => {
      const [hi, mi] = b.horaInicio.split(':').map(Number);
      const [hf, mf] = b.horaFin.split(':').map(Number);
      return s + (hf * 60 + mf - hi * 60 - mi) / 60;
    }, 0);
  }

  /** El practicante acepta el horario de prácticas que le asignaron. */
  protected confirmar(): void {
    this.enviando.set(true);
    this.participantes.confirmarHorario().subscribe({
      next: (p) => {
        this.aplicar(p);
        this.enviando.set(false);
        this.aviso.set('Confirmaste tu horario de prácticas.');
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo confirmar el horario');
      },
    });
  }

  protected enviar(): void {
    if (this.bloques().length === 0) {
      this.error.set('Agrega al menos un bloque de tu horario');
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    this.aviso.set('');

    this.participantes.enviarHorario(this.bloques()).subscribe({
      next: (p) => {
        this.aplicar(p);
        this.enviando.set(false);
        this.aviso.set('Horario enviado. Recursos Humanos lo revisará.');
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo enviar el horario');
      },
    });
  }

  private aplicar(p: Practicante): void {
    this.perfil.set(p);
    this.bloques.set(p.horarioUniversidad.map((b) => ({ ...b })));
  }
}
