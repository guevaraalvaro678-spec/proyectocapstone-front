import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';

import { DIAS_SEMANA, ORDEN_DIAS } from '../../../../core/models/disponibilidad.model';
import { PsicologoDetalle, PsicologoLista } from '../../../../core/models/psicologo.model';
import { PsicologoService } from '../../../../core/services/psicologo.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { fechaHora, fechaLarga, hora } from '../../../../core/utils/fechas';

/** Psicólogos: tabla con conteos, alta de cuentas, edición del perfil y detalle con citas y horarios. */
@Component({
  selector: 'app-psicologos',
  standalone: false,
  templateUrl: './psicologos.html',
  styleUrl: './psicologos.scss',
})
export class Psicologos {
  private readonly fb = inject(FormBuilder);
  private readonly psicologoService = inject(PsicologoService);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly buscar = new FormControl('', { nonNullable: true });
  protected readonly psicologos = signal<PsicologoLista[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');
  protected readonly guardando = signal(false);
  protected readonly trabajandoEn = signal<number | null>(null);

  protected readonly detalle = signal<PsicologoDetalle | null>(null);
  protected readonly cargandoDetalle = signal(false);

  /** null = sin formulario; 0 = psicólogo nuevo; otro número = editando el perfil de ese psicólogo. */
  protected readonly editandoId = signal<number | null>(null);

  protected readonly fecha = fechaLarga;
  protected readonly hora = hora;
  protected readonly fechaHora = fechaHora;

  /** Bloques de horario del psicólogo abierto, por día (solo los días con atención). */
  protected readonly horarioPorDia = computed(() => {
    const bloques = this.detalle()?.disponibilidad ?? [];
    return ORDEN_DIAS.map((dia) => ({ nombre: DIAS_SEMANA[dia], bloques: bloques.filter((b) => b.diaSemana === dia) })).filter(
      (d) => d.bloques.length > 0,
    );
  });

  protected readonly formNuevo = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    telefono: ['', Validators.maxLength(30)],
    especialidad: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    numeroColegiatura: ['', Validators.maxLength(30)],
  });

  constructor() {
    this.cargar();

    this.buscar.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.cargar());
  }

  protected cargar(): void {
    this.cargando.set(true);

    this.psicologoService.listar(this.buscar.value).subscribe({
      next: (psicologos) => {
        this.psicologos.set(psicologos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.mensaje ?? 'No se pudieron cargar los psicólogos.');
        this.cargando.set(false);
      },
    });
  }

  // ---- Alta y edición ----

  protected nuevo(): void {
    this.limpiar();
    this.detalle.set(null);
    this.formNuevo.reset({ nombre: '', correo: '', password: '', telefono: '', especialidad: '', numeroColegiatura: '' });
    this.formNuevo.controls.correo.enable();
    this.formNuevo.controls.password.enable();
    this.editandoId.set(0);
  }

  protected editar(psicologo: PsicologoLista): void {
    this.limpiar();
    this.formNuevo.reset({
      nombre: psicologo.nombre,
      correo: psicologo.correo ?? '',
      password: '',
      telefono: psicologo.telefono ?? '',
      especialidad: psicologo.especialidad ?? '',
      numeroColegiatura: psicologo.numeroColegiatura ?? '',
    });
    // Al editar no se cambia el correo ni la contraseña.
    this.formNuevo.controls.correo.disable();
    this.formNuevo.controls.password.disable();
    this.editandoId.set(psicologo.id);
  }

  protected cancelar(): void {
    this.editandoId.set(null);
  }

  protected guardar(): void {
    if (this.formNuevo.invalid) {
      this.formNuevo.markAllAsTouched();
      return;
    }

    const v = this.formNuevo.getRawValue();
    const id = this.editandoId();
    const comunes = {
      nombre: v.nombre,
      telefono: v.telefono.trim() || null,
      especialidad: v.especialidad,
      numeroColegiatura: v.numeroColegiatura.trim() || null,
    };

    this.guardando.set(true);
    this.limpiar();

    const peticion = id
      ? this.psicologoService.actualizar(id, comunes)
      : this.psicologoService.crear({ ...comunes, correo: v.correo, password: v.password });

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.editandoId.set(null);
        this.aviso.set(id ? 'Perfil actualizado.' : 'Psicólogo creado. Ya puede iniciar sesión con su correo y la contraseña inicial.');
        this.cargar();

        if (id && this.detalle()?.id === id) this.abrirDetalle(id);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(err.status === 409 ? 'Ese correo ya está registrado.' : (err.error?.mensaje ?? 'No se pudo guardar. Revisa los datos.'));
      },
    });
  }

  // ---- Detalle y estado ----

  protected verDetalle(psicologo: PsicologoLista): void {
    this.editandoId.set(null);
    this.abrirDetalle(psicologo.id);
  }

  protected cerrarDetalle(): void {
    this.detalle.set(null);
  }

  protected alternarActivo(psicologo: PsicologoLista): void {
    const pregunta = psicologo.activo
      ? `¿Desactivar a ${psicologo.nombre}? No podrá iniciar sesión ni recibir reservas nuevas.`
      : `¿Reactivar a ${psicologo.nombre}?`;

    if (!confirm(pregunta)) return;

    this.trabajandoEn.set(psicologo.id);
    this.limpiar();

    this.usuarioService.cambiarActivo(psicologo.id, !psicologo.activo).subscribe({
      next: (actualizado) => {
        this.psicologos.update((lista) => lista.map((p) => (p.id === actualizado.id ? { ...p, activo: actualizado.activo } : p)));
        this.trabajandoEn.set(null);
        this.aviso.set(actualizado.activo ? 'Psicólogo reactivado.' : 'Psicólogo desactivado.');
      },
      error: (err: HttpErrorResponse) => {
        this.trabajandoEn.set(null);
        this.error.set(err.error?.mensaje ?? 'No se pudo cambiar el estado.');
      },
    });
  }

  private abrirDetalle(id: number): void {
    this.cargandoDetalle.set(true);

    this.psicologoService.obtenerDetalle(id).subscribe({
      next: (detalle) => {
        this.detalle.set(detalle);
        this.cargandoDetalle.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle.');
        this.cargandoDetalle.set(false);
      },
    });
  }

  private limpiar(): void {
    this.error.set('');
    this.aviso.set('');
  }
}
