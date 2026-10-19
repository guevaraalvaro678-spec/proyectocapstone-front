import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';

import { Cuenta } from '../../Models/cuenta.model';
import { CuentaService } from '../../Services/cuenta.service';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  return control.get('nueva')?.value === control.get('confirmar')?.value ? null : { noCoinciden: true };
}

const NOMBRE_ROL: Record<string, string> = {
  SuperAdmin: 'Super administrador',
  Admin: 'Administrador',
  RRHH: 'Recursos Humanos',
  Voluntario: 'Voluntario',
  Practicante: 'Practicante',
  Postulante: 'Postulante',
};

/** "Mi cuenta y seguridad": datos de contacto editables y cambio de contraseña. Lo usan todos los portales. */
@Component({
  selector: 'app-mi-cuenta',
  standalone: false,
  templateUrl: './com-mi-cuenta.html',
  styleUrl: './com-mi-cuenta.scss',
})
export class MiCuenta {
  private readonly fb = inject(FormBuilder);
  private readonly cuentaService = inject(CuentaService);

  /** En los paneles con franja verde se muestra el encabezado grande. */
  // Con el binding de rutas, si la ruta no trae el dato llega undefined: se toma como true.
  readonly conPortada = input<boolean, boolean | undefined>(true, { transform: (v) => v ?? true });

  protected readonly pestana = signal<'perfil' | 'seguridad'>('perfil');
  protected readonly cuenta = signal<Cuenta | null>(null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  protected readonly iniciales = computed(() =>
    (this.cuenta()?.nombre ?? '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join(''),
  );

  protected readonly rol = computed(() => NOMBRE_ROL[this.cuenta()?.rol ?? ''] ?? this.cuenta()?.rol ?? '');

  /** El DNI se muestra con asteriscos, salvo los dos últimos dígitos. */
  protected readonly dniOculto = computed(() => {
    const dni = this.cuenta()?.dni;
    return dni ? '******' + dni.slice(-2) : 'No registrado';
  });

  protected readonly formPerfil = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    telefono: ['', Validators.maxLength(30)],
  });

  protected readonly formClave = this.fb.nonNullable.group(
    {
      actual: ['', Validators.required],
      nueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmar: ['', Validators.required],
    },
    { validators: passwordsIguales },
  );

  constructor() {
    this.cuentaService.yo().subscribe({
      next: (c) => {
        this.cuenta.set(c);
        this.formPerfil.reset({ nombre: c.nombre, telefono: c.telefono ?? '' });
      },
      error: () => this.error.set('No se pudieron cargar tus datos'),
    });
  }

  protected cambiarPestana(p: 'perfil' | 'seguridad'): void {
    this.pestana.set(p);
    this.error.set('');
    this.aviso.set('');
  }

  protected guardarPerfil(): void {
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      return;
    }

    const { nombre, telefono } = this.formPerfil.getRawValue();
    this.empezar();
    this.cuentaService.actualizarPerfil({ nombre, telefono: telefono || null }).subscribe({
      next: (c) => {
        this.cuenta.set(c);
        this.formPerfil.markAsPristine();
        this.terminar('Tus datos se guardaron.');
      },
      error: (err) => this.fallo(err),
    });
  }

  protected cambiarClave(): void {
    if (this.formClave.invalid) {
      this.formClave.markAllAsTouched();
      return;
    }

    const { actual, nueva } = this.formClave.getRawValue();
    this.empezar();
    this.cuentaService.cambiarPassword(actual, nueva).subscribe({
      next: () => {
        this.formClave.reset();
        this.terminar('Tu contraseña se actualizó.');
      },
      error: (err) => this.fallo(err),
    });
  }

  private empezar(): void {
    this.guardando.set(true);
    this.error.set('');
    this.aviso.set('');
  }

  private terminar(mensaje: string): void {
    this.guardando.set(false);
    this.aviso.set(mensaje);
  }

  private fallo(err: HttpErrorResponse): void {
    this.guardando.set(false);
    this.error.set(err.error?.mensaje ?? 'No se pudo guardar. Revisa los datos.');
  }
}
