import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';

import {
  BloqueHorario,
  DIAS_SEMANA,
  ETIQUETA_HORARIO,
  Practicante,
} from '../../../Modulo-compartido/Models/participante.model';
import { ParticipanteService } from '../../../Modulo-compartido/Services/participante.service';

/** Practicantes: Recursos Humanos revisa su horario de la universidad y les asigna el horario de prácticas. */
@Component({
  selector: 'app-practicantes',
  standalone: false,
  templateUrl: './rol-practicantes.html',
  styleUrl: './rol-practicantes.scss',
})
export class Practicantes {
  private readonly participantes = inject(ParticipanteService);

  protected readonly dias = DIAS_SEMANA;
  protected readonly etiquetas = ETIQUETA_HORARIO;
  protected readonly practicantes = signal<Practicante[]>([]);
  protected readonly filtro = signal('');
  protected readonly cargando = signal(true);
  protected readonly trabajandoEn = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** Practicante al que se le está armando el horario de prácticas. */
  protected readonly asignando = signal<number | null>(null);
  protected readonly bloques = signal<BloqueHorario[]>([]);
  protected readonly nota = signal('');

  protected readonly pendientes = computed(
    () => this.practicantes().filter((p) => p.estadoHorario === 'Pendiente').length,
  );

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.participantes.listarPracticantes(this.filtro()).subscribe({
      next: (lista) => {
        this.practicantes.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los practicantes');
        this.cargando.set(false);
      },
    });
  }

  protected filtrar(estado: string): void {
    this.filtro.set(estado);
    this.cargar();
  }

  protected ponerEnRevision(p: Practicante): void {
    this.trabajandoEn.set(p.usuarioId);
    this.participantes.revisarHorario(p.usuarioId, { estado: 'EnRevision' }).subscribe({
      next: () => this.terminar(`El horario de ${p.nombre} quedó en revisión.`),
      error: (err) => this.fallo(err),
    });
  }

  protected abrirAsignacion(p: Practicante): void {
    this.asignando.set(p.usuarioId);
    this.bloques.set(p.horarioPracticas.length ? p.horarioPracticas.map((b) => ({ ...b })) : [this.bloqueNuevo(1)]);
    this.nota.set('');
  }

  protected agregarBloque(): void {
    const siguiente = Math.min(6, (this.bloques().at(-1)?.diaSemana ?? 0) + 1);
    this.bloques.update((b) => [...b, this.bloqueNuevo(siguiente)]);
  }

  /** Horas asignadas en total (las reglas: lunes a sábado, máx. 5 h por día y 30 h por semana). */
  protected readonly totalHoras = computed(() => this.bloques().reduce((s, b) => s + this.horas(b), 0));

  protected horas(b: BloqueHorario): number {
    const [hi, mi] = b.horaInicio.split(':').map(Number);
    const [hf, mf] = b.horaFin.split(':').map(Number);
    return Math.max(0, (hf * 60 + mf - (hi * 60 + mi)) / 60);
  }

  private bloqueNuevo(dia: number): BloqueHorario {
    return { diaSemana: dia, horaInicio: '08:00', horaFin: '13:00', modalidad: 'Presencial', lugar: 'Sede central AMAAC' };
  }

  protected quitarBloque(indice: number): void {
    this.bloques.update((b) => b.filter((_, i) => i !== indice));
  }

  protected editarBloque(indice: number, campo: keyof BloqueHorario, valor: string): void {
    this.bloques.update((b) =>
      b.map((bloque, i) =>
        i === indice ? { ...bloque, [campo]: campo === 'diaSemana' ? Number(valor) : valor } : bloque,
      ),
    );
  }

  protected aceptar(p: Practicante): void {
    this.trabajandoEn.set(p.usuarioId);
    this.participantes
      .revisarHorario(p.usuarioId, { estado: 'Aceptado', nota: this.nota(), horarioPracticas: this.bloques() })
      .subscribe({
        next: () => {
          this.asignando.set(null);
          this.terminar(`Horario de prácticas de ${p.nombre} confirmado.`);
        },
        error: (err) => this.fallo(err),
      });
  }

  private terminar(mensaje: string): void {
    this.trabajandoEn.set(null);
    this.error.set('');
    this.aviso.set(mensaje);
    this.cargar();
  }

  private fallo(err: HttpErrorResponse): void {
    this.trabajandoEn.set(null);
    this.aviso.set('');
    this.error.set(err.error?.mensaje ?? 'No se pudo completar la acción');
  }
}
