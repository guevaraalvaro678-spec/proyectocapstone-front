import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Cita, ModalidadCita } from '../../../core/models/cita.model';
import { HorarioDisponible, PsicologoPublico } from '../../../core/models/disponibilidad.model';
import { ReservaService } from '../../../core/services/reserva.service';
import { claveDia, fechaLarga, hora } from '../../../core/utils/fechas';

interface DiaConHorarios {
  clave: string;
  titulo: string;
  horarios: HorarioDisponible[];
}

/**
 * Reserva de cita en tres pasos: el paciente elige psicólogo, luego uno de los horarios que ese psicólogo
 * dejó libres y por último confirma con la modalidad y el motivo.
 */
@Component({
  selector: 'app-reservar-cita',
  standalone: false,
  templateUrl: './reservar-cita.html',
  styleUrl: './reservar-cita.scss',
})
export class ReservarCita {
  private readonly fb = inject(FormBuilder);
  private readonly reservaService = inject(ReservaService);

  /** Se emite con la cita creada cuando la reserva sale bien. */
  readonly reservada = output<Cita>();

  protected readonly psicologos = signal<PsicologoPublico[]>([]);
  protected readonly cargandoPsicologos = signal(true);
  protected readonly elegido = signal<PsicologoPublico | null>(null);

  protected readonly horarios = signal<HorarioDisponible[]>([]);
  protected readonly cargandoHorarios = signal(false);
  protected readonly horario = signal<HorarioDisponible | null>(null);

  protected readonly reservando = signal(false);
  protected readonly error = signal('');

  /** Los horarios agrupados por día, para mostrarlos como "Lunes 21 de setiembre: 9:00, 10:00...". */
  protected readonly dias = computed<DiaConHorarios[]>(() => {
    const grupos = new Map<string, DiaConHorarios>();

    for (const h of this.horarios()) {
      const clave = claveDia(h.inicio);
      const grupo = grupos.get(clave) ?? { clave, titulo: fechaLarga(h.inicio), horarios: [] };
      grupo.horarios.push(h);
      grupos.set(clave, grupo);
    }

    return [...grupos.values()];
  });

  /** Un horario "Mixta" permite elegir; los demás fijan la modalidad. */
  protected readonly modalidades = computed<ModalidadCita[]>(() => {
    const modalidad = this.horario()?.modalidad;
    return modalidad === 'Presencial' || modalidad === 'Virtual' ? [modalidad] : ['Presencial', 'Virtual'];
  });

  protected readonly form = this.fb.nonNullable.group({
    modalidad: ['Presencial' as ModalidadCita, Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
  });

  protected readonly hora = hora;

  constructor() {
    this.reservaService.listarPsicologos().subscribe({
      next: (psicologos) => {
        this.psicologos.set(psicologos);
        this.cargandoPsicologos.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los psicólogos.');
        this.cargandoPsicologos.set(false);
      },
    });
  }

  protected elegirPsicologo(psicologo: PsicologoPublico): void {
    this.elegido.set(psicologo);
    this.horario.set(null);
    this.cargarHorarios(psicologo.id);
  }

  protected cambiarPsicologo(): void {
    this.elegido.set(null);
    this.horario.set(null);
    this.horarios.set([]);
    this.error.set('');
  }

  protected elegirHorario(horario: HorarioDisponible): void {
    this.horario.set(horario);
    this.error.set('');

    // Si el horario es solo presencial o solo virtual, la modalidad queda fija.
    if (!this.modalidades().includes(this.form.controls.modalidad.value)) {
      this.form.controls.modalidad.setValue(this.modalidades()[0]);
    }
  }

  protected confirmar(): void {
    const psicologo = this.elegido();
    const horario = this.horario();

    if (!psicologo || !horario) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.reservando.set(true);
    this.error.set('');

    const { modalidad, motivo } = this.form.getRawValue();

    this.reservaService
      .reservar({ psicologoId: psicologo.id, fechaInicio: horario.inicio, modalidad, motivo })
      .subscribe({
        next: (cita) => {
          this.reservando.set(false);
          this.form.reset({ modalidad: 'Presencial', motivo: '' });
          this.reservada.emit(cita);
        },
        error: (err: HttpErrorResponse) => {
          this.reservando.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo reservar la cita.');

          // Si el horario se ocupó mientras se elegía, se actualiza la lista para ofrecer los que quedan.
          if (err.status === 409) {
            this.horario.set(null);
            this.cargarHorarios(psicologo.id);
          }
        },
      });
  }

  private cargarHorarios(psicologoId: number): void {
    this.cargandoHorarios.set(true);
    this.horarios.set([]);

    this.reservaService.listarHorarios(psicologoId).subscribe({
      next: (horarios) => {
        this.horarios.set(horarios);
        this.cargandoHorarios.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los horarios.');
        this.cargandoHorarios.set(false);
      },
    });
  }
}
