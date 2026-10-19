import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';

import { RolAdmin } from '../../../Modulo-compartido/Models/auth.model';
import { AuthService } from '../../../Modulo-compartido/Services/auth.service';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmar = control.get('confirmar')?.value;
  return password === confirmar ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-crear-usuario',
  standalone: false,
  templateUrl: './rol-crear-usuario.html',
  styleUrl: './rol-crear-usuario.scss',
})
export class CrearUsuario {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly roles: RolAdmin[] = ['Admin', 'SuperAdmin'];
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');

  protected readonly form = this.fb.nonNullable.group(
    {
      usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      confirmar: ['', Validators.required],
      rol: ['Admin' as RolAdmin, Validators.required],
    },
    { validators: passwordsIguales },
  );

  protected crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');

    const { usuario, password, rol } = this.form.getRawValue();

    this.auth.crearUsuario({ usuario, password, rol }).subscribe({
      next: (creado) => {
        this.cargando.set(false);
        this.exito.set(`Usuario "${creado.usuario}" creado como ${creado.rol}`);
        this.form.reset({ usuario: '', password: '', confirmar: '', rol: 'Admin' });
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          err.status === 409
            ? 'Ese nombre de usuario ya existe'
            : err.status === 403
              ? 'No tienes permiso para crear usuarios'
              : err.status === 400
                ? 'Revisa los datos ingresados'
                : 'No se pudo conectar con el servidor',
        );
      },
    });
  }
}
