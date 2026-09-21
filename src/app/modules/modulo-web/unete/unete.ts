import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { DEPARTAMENTOS } from '../../../core/models/participante.model';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleService } from '../../../core/services/google.service';
import { ParticipanteService } from '../../../core/services/participante.service';

type Tipo = 'voluntario' | 'practicante';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmar')?.value ? null : { noCoinciden: true };
}

/** "Únete": el visitante elige ser voluntario (registro corto) o practicante (registro completo). */
@Component({
  selector: 'app-unete',
  standalone: false,
  templateUrl: './unete.html',
  styleUrl: './unete.scss',
})
export class Unete {
  private readonly fb = inject(FormBuilder);
  private readonly participantes = inject(ParticipanteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly google = inject(GoogleService);
  private readonly botonGoogle = viewChild<ElementRef<HTMLElement>>('botonGoogle');

  protected readonly departamentos = DEPARTAMENTOS;
  protected readonly tipo = signal<Tipo | null>(null);
  protected readonly cargando = signal(false);
  protected readonly voluntarioListo = signal(false);
  protected readonly error = signal('');

  /** Token de Google: si existe, el registro usa esa cuenta (correo verificado) y no pide contraseña. */
  protected readonly googleCredential = signal<string | null>(null);

  protected readonly formVoluntario = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
  });

  protected readonly formPracticante = this.fb.nonNullable.group(
    {
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      telefono: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      universidad: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      carrera: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      ciclo: ['', [Validators.required, Validators.maxLength(30)]],
      departamentoPrincipal: ['', Validators.required],
      departamentoSecundario: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmar: ['', Validators.required],
    },
    { validators: passwordsIguales },
  );

  constructor() {
    void this.google.preparar();

    // Dibuja el botón de Google cuando ya está disponible y hay un formulario elegido.
    effect(() => {
      const contenedor = this.botonGoogle()?.nativeElement;
      if (contenedor && this.google.disponible()) {
        this.google.dibujarBoton(contenedor, (credential) => this.usarGoogle(credential));
      }
    });
  }

  /** Precarga nombres, apellidos y correo desde la cuenta de Google y quita la contraseña del formulario. */
  private usarGoogle(credential: string): void {
    this.error.set('');

    this.google.perfil(credential).subscribe({
      next: (perfil) => {
        this.googleCredential.set(credential);
        const datos = { nombres: perfil.nombres, apellidos: perfil.apellidos, correo: perfil.correo };
        this.formVoluntario.patchValue(datos);
        this.formPracticante.patchValue(datos);

        for (const campo of ['password', 'confirmar'] as const) {
          this.formPracticante.controls[campo].clearValidators();
          this.formPracticante.controls[campo].updateValueAndValidity();
        }
      },
      error: (err: HttpErrorResponse) => this.error.set(err.error?.mensaje ?? 'No se pudo usar tu cuenta de Google'),
    });
  }

  protected elegir(tipo: Tipo): void {
    this.tipo.set(tipo);
    this.error.set('');
    this.voluntarioListo.set(false);
  }

  protected enviarVoluntario(): void {
    if (this.formVoluntario.invalid) {
      this.formVoluntario.markAllAsTouched();
      return;
    }

    this.iniciar();
    const datos = { ...this.formVoluntario.getRawValue(), googleCredential: this.googleCredential() ?? undefined };

    this.participantes.registrarVoluntario(datos).subscribe({
      next: (respuesta) => {
        // Con Google ya quedó logueado y va a su espacio; si no, se le avisa que revise su correo.
        if ('token' in respuesta) {
          void this.router.navigate([this.auth.rutaInicial()]);
          return;
        }
        this.cargando.set(false);
        this.voluntarioListo.set(true);
      },
      error: (err) => this.fallo(err),
    });
  }

  protected enviarPracticante(): void {
    if (this.formPracticante.invalid) {
      this.formPracticante.markAllAsTouched();
      return;
    }

    this.iniciar();
    const { confirmar, ...resto } = this.formPracticante.getRawValue();
    const datos = { ...resto, googleCredential: this.googleCredential() ?? undefined };

    this.participantes.registrarPracticante(datos).subscribe({
      next: () => this.router.navigate([this.auth.rutaInicial()]),
      error: (err) => this.fallo(err),
    });
  }

  private iniciar(): void {
    this.cargando.set(true);
    this.error.set('');
  }

  private fallo(err: HttpErrorResponse): void {
    this.cargando.set(false);
    this.error.set(
      err.status === 409
        ? (err.error?.mensaje ?? 'Ese correo o DNI ya está registrado.')
        : err.status === 400
          ? 'Revisa los datos ingresados: todos son obligatorios.'
          : 'No se pudo conectar con el servidor',
    );
  }
}
