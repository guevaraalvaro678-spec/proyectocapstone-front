import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { UsuarioService } from '../../../core/services/usuario.service';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmar')?.value ? null : { noCoinciden: true };
}

/** Pantalla a la que llega el enlace del correo: crea la contraseña nueva. */
@Component({
  selector: 'app-restablecer',
  standalone: false,
  templateUrl: './restablecer.html',
  styleUrl: './restablecer.scss',
})
export class Restablecer {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  private readonly parametros = inject(ActivatedRoute).snapshot.queryParamMap;
  private readonly correo = this.parametros.get('correo') ?? '';
  private readonly token = this.parametros.get('token') ?? '';

  /** Sin correo y token en la dirección el enlace está incompleto. */
  protected readonly enlaceValido = !!this.correo && !!this.token;

  protected readonly cargando = signal(false);
  protected readonly listo = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmar: ['', Validators.required],
    },
    { validators: passwordsIguales },
  );

  protected cambiar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.usuarioService.restablecerPassword(this.correo, this.token, this.form.getRawValue().password).subscribe({
      next: () => {
        this.cargando.set(false);
        this.listo.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          err.status === 400
            ? 'El enlace no es válido o ya venció. Pide uno nuevo.'
            : 'No se pudo cambiar la contraseña. Inténtalo de nuevo.',
        );
      },
    });
  }
}
