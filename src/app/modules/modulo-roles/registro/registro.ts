import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CuentaService } from '../../../core/services/cuenta.service';
import { GoogleService } from '../../../core/services/google.service';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmar')?.value ? null : { noCoinciden: true };
}

/**
 * "Crea tu cuenta": solo correo y contraseña (o Google). La cuenta nace como postulante y
 * pasa directo al formulario de postulación.
 */
@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly cuentaService = inject(CuentaService);
  private readonly router = inject(Router);
  protected readonly google = inject(GoogleService);
  private readonly botonGoogle = viewChild<ElementRef<HTMLElement>>('botonGoogle');

  /** Si llegó desde "Postular como voluntario/practicante", se conserva para el formulario. */
  private readonly tipo = inject(ActivatedRoute).snapshot.queryParamMap.get('tipo');

  protected readonly cargando = signal(false);
  protected readonly verClave = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group(
    {
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmar: ['', Validators.required],
      acepto: [false, Validators.requiredTrue],
    },
    { validators: passwordsIguales },
  );

  constructor() {
    void this.google.preparar();

    effect(() => {
      const contenedor = this.botonGoogle()?.nativeElement;
      if (contenedor && this.google.disponible()) {
        this.google.dibujarBoton(contenedor, (credential) => this.conGoogle(credential));
      }
    });
  }

  protected crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { correo, password } = this.form.getRawValue();
    this.cargando.set(true);
    this.error.set('');

    this.cuentaService.registrar(correo, password).subscribe({
      next: () => this.irAPostular(),
      error: (err: HttpErrorResponse) => this.fallo(err),
    });
  }

  private conGoogle(credential: string): void {
    this.cargando.set(true);
    this.error.set('');
    this.cuentaService.continuarConGoogle(credential).subscribe({
      // Sin cuenta: al formulario con sus datos de Google. Con cuenta: "participar" lo lleva a su lugar.
      next: (r) =>
        this.router.navigate([r === 'nuevo' ? '/postular' : '/participar'], {
          queryParams: this.tipo ? { tipo: this.tipo } : {},
        }),
      error: (err: HttpErrorResponse) => this.fallo(err),
    });
  }

  private irAPostular(): void {
    void this.router.navigate(['/postular'], { queryParams: this.tipo ? { tipo: this.tipo } : {} });
  }

  private fallo(err: HttpErrorResponse): void {
    this.cargando.set(false);
    this.error.set(
      err.status === 409
        ? (err.error?.mensaje ?? 'Ese correo ya tiene una cuenta. Inicia sesión.')
        : err.status === 400
          ? (err.error?.mensaje ?? 'Revisa los datos ingresados')
          : 'No se pudo conectar con el servidor',
    );
  }
}
