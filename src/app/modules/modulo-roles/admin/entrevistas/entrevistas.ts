import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ETIQUETA_POSTULACION, SesionEntrevista, SesionEntrevistaDetalle } from '../../../../core/models/postulacion.model';
import { PostulacionService } from '../../../../core/services/postulacion.service';

/** Hora de Lima (UTC-5) de una fecha ISO en formato de los inputs date y time. */
function aLima(iso: string): { fecha: string; hora: string } {
  const lima = new Date(new Date(iso).getTime() - 5 * 3600 * 1000).toISOString();
  return { fecha: lima.slice(0, 10), hora: lima.slice(11, 16) };
}

/** Sesiones de entrevista grupal: se programan con cupo y se les asignan postulantes desde Postulaciones. */
@Component({
  selector: 'app-entrevistas',
  standalone: false,
  templateUrl: './entrevistas.html',
  styleUrl: './entrevistas.scss',
})
export class Entrevistas {
  private readonly postulacionService = inject(PostulacionService);
  private readonly fb = inject(FormBuilder);

  protected readonly etiquetas = ETIQUETA_POSTULACION;
  protected readonly sesiones = signal<SesionEntrevista[]>([]);
  protected readonly filtro = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** null = cerrado; 0 = nueva; >0 = editando esa sesión. */
  protected readonly editando = signal<number | null>(null);
  protected readonly detalle = signal<SesionEntrevistaDetalle | null>(null);
  protected readonly trabajando = signal(false);
  protected readonly errorCajon = signal('');

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    fecha: ['', Validators.required],
    horaInicio: ['10:00', Validators.required],
    horaFin: ['11:30', Validators.required],
    modalidad: ['Virtual' as 'Virtual' | 'Presencial'],
    lugarOEnlace: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
    cupo: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
  });

  protected readonly filtradas = computed(() =>
    this.filtro() ? this.sesiones().filter((s) => s.estado === this.filtro()) : this.sesiones(),
  );

  protected readonly indicadores = computed(() => {
    const ahora = Date.now();
    const programadas = this.sesiones().filter((s) => s.estado === 'Programada' && new Date(s.fin).getTime() >= ahora);
    return {
      proximas: programadas.length,
      conCupo: programadas.filter((s) => s.inscritos < s.cupo).length,
      realizadas: this.sesiones().filter((s) => s.estado === 'Realizada').length,
    };
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.postulacionService.listarSesiones().subscribe({
      next: (lista) => {
        this.sesiones.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las sesiones');
        this.cargando.set(false);
      },
    });
  }

  protected porcentaje(s: SesionEntrevista): number {
    return s.cupo ? Math.round((s.inscritos / s.cupo) * 100) : 0;
  }

  protected nueva(): void {
    this.detalle.set(null);
    this.errorCajon.set('');
    this.form.reset({ nombre: '', fecha: '', horaInicio: '10:00', horaFin: '11:30', modalidad: 'Virtual', lugarOEnlace: '', cupo: 10 });
    this.editando.set(0);
  }

  protected editar(s: SesionEntrevista): void {
    const inicio = aLima(s.inicio);
    const fin = aLima(s.fin);
    this.errorCajon.set('');
    this.form.reset({
      nombre: s.nombre,
      fecha: inicio.fecha,
      horaInicio: inicio.hora,
      horaFin: fin.hora,
      modalidad: s.modalidad,
      lugarOEnlace: s.lugarOEnlace,
      cupo: s.cupo,
    });
    this.detalle.set(null);
    this.editando.set(s.id);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    // La hora se escribe en hora de Lima (UTC-5).
    const datos = {
      nombre: v.nombre,
      inicio: new Date(`${v.fecha}T${v.horaInicio}:00-05:00`).toISOString(),
      fin: new Date(`${v.fecha}T${v.horaFin}:00-05:00`).toISOString(),
      modalidad: v.modalidad,
      lugarOEnlace: v.lugarOEnlace,
      cupo: Number(v.cupo),
    };

    const id = this.editando();
    const peticion = id ? this.postulacionService.actualizarSesion(id, datos) : this.postulacionService.crearSesion(datos);

    this.trabajando.set(true);
    peticion.subscribe({
      next: (s) => {
        this.trabajando.set(false);
        this.editando.set(null);
        this.aviso.set(id ? `Sesión ${s.codigo} actualizada.` : `Sesión ${s.codigo} creada.`);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.trabajando.set(false);
        this.errorCajon.set(err.error?.mensaje ?? 'No se pudo guardar la sesión');
      },
    });
  }

  protected verDetalle(s: SesionEntrevista): void {
    this.editando.set(null);
    this.errorCajon.set('');
    this.postulacionService.obtenerSesion(s.id).subscribe({
      next: (d) => this.detalle.set(d),
      error: () => this.error.set('No se pudo abrir la sesión'),
    });
  }

  protected cambiarEstado(s: SesionEntrevista, estado: 'Realizada' | 'Cancelada'): void {
    const texto =
      estado === 'Realizada'
        ? '¿Marcar la sesión como realizada? Sus postulantes pasarán a "Entrevista realizada".'
        : '¿Cancelar la sesión? Sus postulantes volverán a "Habilitada para entrevista".';
    if (!confirm(texto)) return;

    this.trabajando.set(true);
    this.postulacionService.cambiarEstadoSesion(s.id, estado).subscribe({
      next: () => {
        this.trabajando.set(false);
        this.aviso.set(estado === 'Realizada' ? 'Sesión marcada como realizada.' : 'Sesión cancelada.');
        this.verDetalle(s);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.trabajando.set(false);
        this.errorCajon.set(err.error?.mensaje ?? 'No se pudo cambiar el estado');
      },
    });
  }

  protected cerrar(): void {
    this.editando.set(null);
    this.detalle.set(null);
  }
}
