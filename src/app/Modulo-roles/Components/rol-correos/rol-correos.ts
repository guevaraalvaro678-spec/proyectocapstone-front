import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { AudienciaCorreo, Correo, CorreoEstado } from '../../Models/correo.model';
import { CorreoService } from '../../Services/correo.service';
import { fechaHora } from '../../Utils/fechas';

/** Correos y notificaciones: el administrador redacta mensajes para una persona o un grupo y ve qué se envió. */
@Component({
  selector: 'app-correos',
  standalone: false,
  templateUrl: './rol-correos.html',
  styleUrl: './rol-correos.scss',
})
export class Correos {
  private readonly fb = inject(FormBuilder);
  private readonly correoService = inject(CorreoService);

  /** Grupos de envío con su texto: los define el backend (GET api/correo/audiencias). */
  protected readonly audiencias = signal<{ valor: AudienciaCorreo; texto: string }[]>([]);

  protected readonly estado = signal<CorreoEstado | null>(null);
  protected readonly historial = signal<Correo[]>([]);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');
  protected readonly trabajandoEn = signal<number | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    audiencia: ['Usuarios' as AudienciaCorreo, Validators.required],
    correo: [''],
    asunto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    mensaje: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5000)]],
    incluirSinPreferencia: [false],
  });

  /** El grupo elegido: define qué campos del formulario tienen sentido. */
  protected readonly audiencia = signal<AudienciaCorreo>('Usuarios');
  protected readonly esIndividual = computed(() => this.audiencia() === 'Individual');
  protected readonly incluyeUsuarios = computed(() => this.audiencia() === 'Usuarios' || this.audiencia() === 'Todos');

  /** Correos que esperan salir, según el backend (no se recuenta del historial, que llega recortado). */
  protected readonly pendientes = computed(() => this.estado()?.pendientes ?? 0);

  protected readonly fechaHora = fechaHora;

  constructor() {
    this.correoService.audiencias().subscribe((a) => this.audiencias.set(a));
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);

    this.correoService.obtenerEstado().subscribe({ next: (estado) => this.estado.set(estado) });

    this.correoService.historial().subscribe({
      next: (historial) => {
        this.historial.set(historial);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el historial de correos.');
        this.cargando.set(false);
      },
    });
  }

  protected cambiarAudiencia(valor: string): void {
    const audiencia = valor as AudienciaCorreo;
    this.audiencia.set(audiencia);

    // El correo solo se pide para un envío individual.
    const correo = this.form.controls.correo;
    correo.setValidators(audiencia === 'Individual' ? [Validators.required, Validators.email] : []);
    correo.updateValueAndValidity();
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const destino = this.esIndividual() ? v.correo : (this.audiencias().find((a) => a.valor === v.audiencia)?.texto ?? '').toLowerCase();

    if (!confirm(`¿Enviar "${v.asunto}" a: ${destino}?`)) return;

    this.enviando.set(true);
    this.error.set('');
    this.aviso.set('');

    this.correoService
      .enviar({
        audiencia: v.audiencia,
        correo: this.esIndividual() ? v.correo : null,
        asunto: v.asunto,
        mensaje: v.mensaje,
        incluirSinPreferencia: v.incluirSinPreferencia,
      })
      .subscribe({
        next: (resultado) => {
          this.enviando.set(false);
          this.aviso.set(`Listo: ${resultado.destinatarios} ${resultado.destinatarios === 1 ? 'correo quedó' : 'correos quedaron'} en la cola de envío.`);
          this.form.patchValue({ asunto: '', mensaje: '' });
          this.form.markAsUntouched();
          this.cargar();
        },
        error: (err: HttpErrorResponse) => {
          this.enviando.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo enviar. Revisa los datos.');
        },
      });
  }

  protected reintentar(correo: Correo): void {
    this.trabajandoEn.set(correo.id);
    this.error.set('');

    this.correoService.reintentar(correo.id).subscribe({
      next: () => {
        this.trabajandoEn.set(null);
        this.aviso.set('El correo volvió a la cola de envío.');
        this.cargar();
      },
      error: () => {
        this.trabajandoEn.set(null);
        this.error.set('No se pudo reintentar el envío.');
      },
    });
  }

  protected claseEstado(estado: string): string {
    switch (estado) {
      case 'Enviado':
        return 'ui-etiqueta--verde';
      case 'Fallido':
        return 'ui-etiqueta--roja';
      case 'Pendiente':
        return 'ui-etiqueta--amarilla';
      default:
        return 'ui-etiqueta--azul';
    }
  }
}
