import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';

import { RolGestion } from '../../../Modulo-compartido/Models/auth.model';
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

  protected readonly roles: { valor: RolGestion; etiqueta: string }[] = [
    { valor: 'RRHH', etiqueta: 'Recursos Humanos' },
    { valor: 'Admin', etiqueta: 'Administrador' },
    { valor: 'SuperAdmin', etiqueta: 'Super administrador' },
  ];
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmar: ['', Validators.required],
      rol: ['RRHH' as RolGestion, Validators.required],
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

    const { nombre, correo, password, rol } = this.form.getRawValue();

    this.auth.crearUsuario({ nombre, correo, password, rol }).subscribe({
      next: (creado) => {
        this.cargando.set(false);
        this.exito.set(`Cuenta ${creado.usuario} creada como ${this.roles.find((r) => r.valor === creado.rol)?.etiqueta ?? creado.rol}. Le enviamos un correo con las indicaciones.`);
        this.form.reset({ nombre: '', correo: '', password: '', confirmar: '', rol: 'RRHH' });
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        const validacion = err.error?.errors ? Object.values(err.error.errors as Record<string, string[]>)[0]?.[0] : null;
        this.error.set(
          err.status === 409
            ? (err.error?.mensaje ?? 'Ese correo ya tiene una cuenta')
            : err.status === 403
              ? 'No tienes permiso para crear usuarios'
              : err.status === 400
                ? (validacion ?? 'Revisa los datos ingresados')
                : 'No se pudo conectar con el servidor',
        );
      },
    });
  }
}
