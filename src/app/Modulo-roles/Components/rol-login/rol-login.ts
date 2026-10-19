import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../Modulo-compartido/Services/auth.service';
import { CuentaService } from '../../../Modulo-compartido/Services/cuenta.service';
import { GoogleService } from '../../../Modulo-compartido/Services/google.service';

/** "Inicia sesión": cualquier cuenta entra aquí y va a su espacio según el rol. */
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './rol-login.html',
  styleUrl: './rol-login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly cuentaService = inject(CuentaService);
  private readonly router = inject(Router);
  protected readonly google = inject(GoogleService);
  private readonly botonGoogle = viewChild<ElementRef<HTMLElement>>('botonGoogle');

  protected readonly cargando = signal(false);
  protected readonly verClave = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    void this.google.preparar();

    // Dibuja el botón de Google cuando ya está disponible y el contenedor existe en pantalla.
    effect(() => {
      const contenedor = this.botonGoogle()?.nativeElement;
      if (contenedor && this.google.disponible()) {
        this.google.dibujarBoton(contenedor, (credential) => this.ingresarConGoogle(credential));
      }
    });
  }

  protected ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate([this.auth.rutaInicial()]),
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          err.status === 401
            ? 'Correo o contraseña incorrectos'
            : err.status === 403
              ? (err.error?.mensaje ?? 'Tu cuenta está desactivada')
              : 'No se pudo conectar con el servidor',
        );
      },
    });
  }

  /** Con cuenta entra directo; sin cuenta va al formulario de postulación con sus datos de Google. */
  private ingresarConGoogle(credential: string): void {
    this.cargando.set(true);
    this.error.set('');

    this.cuentaService.continuarConGoogle(credential).subscribe({
      next: (r) => this.router.navigate([r === 'nuevo' ? '/postular' : this.auth.rutaInicial()]),
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo iniciar sesión con Google');
      },
    });
  }
}
