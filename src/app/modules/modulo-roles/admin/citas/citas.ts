import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';

import { Cita, CitaCrear, EstadoCita, ESTADOS_CITA, ModalidadCita } from '../../../../core/models/cita.model';
import { PsicologoLista } from '../../../../core/models/psicologo.model';
import { UsuarioLista } from '../../../../core/models/usuario-admin.model';
import { CitaService } from '../../../../core/services/cita.service';
import { PsicologoService } from '../../../../core/services/psicologo.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { aInputLocal, claveDia, deInputLocal, fechaLarga, hora } from '../../../../core/utils/fechas';

/** Citas del sistema: el administrador las ve con filtros, las agenda, las reprograma y cambia su estado. */
@Component({
  selector: 'app-citas',
  standalone: false,
  templateUrl: './citas.html',
  styleUrl: './citas.scss',
})
export class Citas {
  private readonly fb = inject(FormBuilder);
  private readonly citaService = inject(CitaService);
  private readonly psicologoService = inject(PsicologoService);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly estados = ESTADOS_CITA;

  protected readonly citas = signal<Cita[]>([]);
  protected readonly psicologos = signal<PsicologoLista[]>([]);
  protected readonly pacientes = signal<UsuarioLista[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly trabajandoEn = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** null = formulario cerrado; 0 = cita nueva; otro número = reprogramando esa cita. */
  protected readonly editandoId = signal<number | null>(null);

  protected readonly fecha = fechaLarga;
  protected readonly hora = hora;

  /** Por defecto se ven las citas desde hoy en adelante. */
  protected readonly filtros = this.fb.nonNullable.group({
    estado: ['' as EstadoCita | ''],
    psicologoId: [0],
    pacienteId: [0],
    desde: [claveDia(new Date().toISOString())],
    hasta: [''],
  });

  protected readonly form = this.fb.nonNullable.group({
    pacienteId: [0, [Validators.required, Validators.min(1)]],
    psicologoId: [0, [Validators.required, Validators.min(1)]],
    fechaInicio: ['', Validators.required],
    duracionMinutos: [50, [Validators.required, Validators.min(15), Validators.max(180)]],
    modalidad: ['Presencial' as ModalidadCita, Validators.required],
    lugar: ['', Validators.maxLength(200)],
    motivo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
  });

  constructor() {
    this.psicologoService.listar('', true).subscribe((lista) => this.psicologos.set(lista));
    this.usuarioService.listar('Usuario', '', true).subscribe((lista) => this.pacientes.set(lista));

    this.cargar();
    this.filtros.valueChanges.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(() => this.cargar());
  }

  protected cargar(): void {
    this.cargando.set(true);
    const f = this.filtros.getRawValue();

    this.citaService
      .listar({
        estado: f.estado,
        psicologoId: f.psicologoId || null,
        pacienteId: f.pacienteId || null,
        // Los filtros de fecha son días completos en la hora local.
        desde: f.desde ? new Date(`${f.desde}T00:00:00`).toISOString() : undefined,
        hasta: f.hasta ? new Date(`${f.hasta}T23:59:59`).toISOString() : undefined,
      })
      .subscribe({
        next: (citas) => {
          this.citas.set(citas);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las citas.');
          this.cargando.set(false);
        },
      });
  }

  protected limpiarFiltros(): void {
    this.filtros.reset({ estado: '', psicologoId: 0, pacienteId: 0, desde: '', hasta: '' });
  }

  // ---- Agendar y reprogramar ----

  protected nueva(): void {
    this.limpiarMensajes();
    this.form.reset({ pacienteId: 0, psicologoId: 0, fechaInicio: '', duracionMinutos: 50, modalidad: 'Presencial', lugar: '', motivo: '' });
    this.editandoId.set(0);
  }

  protected editar(cita: Cita): void {
    this.limpiarMensajes();
    this.form.reset({
      pacienteId: cita.pacienteId,
      psicologoId: cita.psicologoId,
      fechaInicio: aInputLocal(cita.fechaInicio),
      duracionMinutos: cita.duracionMinutos,
      modalidad: cita.modalidad,
      lugar: cita.lugar ?? '',
      motivo: cita.motivo,
    });
    this.editandoId.set(cita.id);
  }

  protected cancelarFormulario(): void {
    this.editandoId.set(null);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos: CitaCrear = {
      pacienteId: v.pacienteId,
      psicologoId: v.psicologoId,
      // El campo trae la hora local; el backend la guarda en UTC.
      fechaInicio: deInputLocal(v.fechaInicio),
      duracionMinutos: v.duracionMinutos,
      modalidad: v.modalidad,
      lugar: v.lugar.trim() || null,
      motivo: v.motivo,
    };

    const id = this.editandoId();
    this.guardando.set(true);
    this.limpiarMensajes();

    (id ? this.citaService.actualizar(id, datos) : this.citaService.crear(datos)).subscribe({
      next: () => {
        this.guardando.set(false);
        this.editandoId.set(null);
        this.aviso.set(id ? 'Cita reprogramada. Se avisó al paciente y al psicólogo.' : 'Cita agendada. Se avisó al paciente y al psicólogo.');
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo guardar la cita. Revisa los datos.');
      },
    });
  }

  // ---- Cambios de estado ----

  protected puedeEditar(cita: Cita): boolean {
    return cita.estado === 'Programada' || cita.estado === 'Confirmada';
  }

  protected puedeRealizar(cita: Cita): boolean {
    return cita.estado === 'Confirmada' && new Date(cita.fechaInicio).getTime() <= Date.now();
  }

  protected confirmar(cita: Cita): void {
    this.cambiarEstado(cita, 'Confirmada', 'Cita confirmada.');
  }

  protected realizar(cita: Cita): void {
    this.cambiarEstado(cita, 'Realizada', 'Cita marcada como realizada.');
  }

  protected cancelar(cita: Cita): void {
    if (!confirm(`¿Cancelar la cita de ${cita.pacienteNombre} con ${cita.psicologoNombre}? Se les avisará por correo.`)) return;

    this.cambiarEstado(cita, 'Cancelada', 'Cita cancelada.');
  }

  protected claseEstado(estado: EstadoCita): string {
    switch (estado) {
      case 'Confirmada':
        return 'ui-etiqueta--verde';
      case 'Cancelada':
        return 'ui-etiqueta--roja';
      case 'Realizada':
        return '';
      default:
        return 'ui-etiqueta--azul';
    }
  }

  private cambiarEstado(cita: Cita, estado: EstadoCita, mensaje: string): void {
    this.trabajandoEn.set(cita.id);
    this.limpiarMensajes();

    this.citaService.cambiarEstado(cita.id, { estado }).subscribe({
      next: (actualizada) => {
        this.citas.update((lista) => lista.map((c) => (c.id === actualizada.id ? actualizada : c)));
        this.trabajandoEn.set(null);
        this.aviso.set(mensaje);
      },
      error: (err: HttpErrorResponse) => {
        this.trabajandoEn.set(null);
        this.error.set(err.error?.mensaje ?? 'No se pudo cambiar el estado de la cita.');
      },
    });
  }

  private limpiarMensajes(): void {
    this.error.set('');
    this.aviso.set('');
  }
}
