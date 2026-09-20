import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';

import { ColaboradorService } from '../../../core/services/colaborador.service';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmar')?.value
    ? null
    : { noCoinciden: true };
}

/** "Trabaja con nosotros": elegir entre crear una cuenta de usuario o postular como psicólogo colaborador. */
@Component({
  selector: 'app-unete',
  standalone: false,
  templateUrl: './unete.html',
  styleUrl: './unete.scss',
})
export class Unete {
  private readonly fb = inject(FormBuilder);
  private readonly colaboradorService = inject(ColaboradorService);

  protected readonly mostrarForm = signal(false);
  protected readonly cargando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      telefono: ['', Validators.maxLength(30)],
      especialidad: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      numeroColegiatura: ['', Validators.maxLength(30)],
      presentacion: ['', Validators.maxLength(1000)],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmar: ['', Validators.required],
    },
    { validators: passwordsIguales },
  );

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    const { confirmar, ...datos } = this.form.getRawValue();

    this.colaboradorService.postular(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.enviado.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          err.status === 409
            ? 'Ese correo ya tiene una cuenta o una postulación en curso.'
            : err.status === 400
              ? 'Revisa los datos ingresados'
              : 'No se pudo conectar con el servidor',
        );
      },
    });
  }
}
