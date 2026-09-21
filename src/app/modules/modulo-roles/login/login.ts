import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { GoogleService } from '../../../core/services/google.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly google = inject(GoogleService);
  private readonly botonGoogle = viewChild<ElementRef<HTMLElement>>('botonGoogle');

  protected readonly cargando = signal(false);
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

  private ingresarConGoogle(credential: string): void {
    this.cargando.set(true);
    this.error.set('');

    this.auth.loginGoogle(credential).subscribe({
      next: () => this.router.navigate([this.auth.rutaInicial()]),
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);

        // Cuenta de Google sin registro: se pasa a "Únete" para que elija voluntario o practicante.
        if (err.status === 404) {
          this.google.credencialPendiente.set(credential);
          void this.router.navigate(['/unete']);
          return;
        }

        this.error.set(err.error?.mensaje ?? 'No se pudo iniciar sesión con Google');
      },
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
      // Cada cuenta va a su lugar: administradores al panel, psicólogos a su agenda y usuarios a su espacio.
      next: () => this.router.navigate([this.auth.rutaInicial()]),
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          err.status === 401
            ? 'Usuario o contraseña incorrectos'
            : err.status === 403
              ? (err.error?.mensaje ?? 'Tu cuenta está desactivada')
              : 'No se pudo conectar con el servidor',
        );
      },
    });
  }
}
