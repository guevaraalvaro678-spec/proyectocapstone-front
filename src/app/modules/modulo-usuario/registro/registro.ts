import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmar')?.value
    ? null
    : { noCoinciden: true };
}

/** Registro de un usuario común: crea la cuenta en el backend y lo lleva a su espacio ya logueado. */
@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmar: ['', Validators.required],
      acepto: [false, Validators.requiredTrue],
    },
    { validators: passwordsIguales },
  );

  protected registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    const { nombre, correo, password } = this.form.getRawValue();

    this.auth.registrarUsuario({ nombre, correo, password }).subscribe({
      next: () => this.router.navigate([this.auth.rutaInicial()]),
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          err.status === 409
            ? 'Ese correo ya está registrado. Prueba iniciar sesión.'
            : err.status === 400
              ? 'Revisa los datos ingresados'
              : 'No se pudo conectar con el servidor',
        );
      },
    });
  }
}
