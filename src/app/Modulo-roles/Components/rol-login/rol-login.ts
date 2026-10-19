import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CanalVerificacion } from '../../../Modulo-compartido/Models/auth.model';
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

  // ---- Verificación en dos pasos (las reglas y los códigos los maneja el backend) ----
  protected readonly paso = signal<'credenciales' | 'canal' | 'codigo'>('credenciales');
  protected readonly desafio = signal('');
  protected readonly canales = signal<CanalVerificacion[]>([]);
  protected readonly canalElegido = signal<CanalVerificacion['canal']>('correo');
  protected readonly destino = signal('');
  protected readonly aviso = signal('');
  protected readonly codigo = this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^\d{6}$/)]);

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
      next: (r) => {
        this.cargando.set(false);
        if (r.sesion) {
          void this.router.navigate([this.auth.rutaInicial()]);
          return;
        }
        // Contraseña correcta: falta el código de verificación.
        this.desafio.set(r.desafio ?? '');
        this.canales.set(r.canales);
        this.canalElegido.set(r.canales[0]?.canal ?? 'correo');
        this.codigo.reset();
        this.paso.set('canal');
      },
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

  protected enviarCodigo(): void {
    this.cargando.set(true);
    this.error.set('');
    this.aviso.set('');
    this.auth.solicitarCodigo(this.desafio(), this.canalElegido()).subscribe({
      next: (r) => {
        this.cargando.set(false);
        this.destino.set(r.destino);
        this.aviso.set(`Te enviamos un código a ${r.destino}. Vence en ${Math.round(r.expiraEnSegundos / 60)} minutos.`);
        this.paso.set('codigo');
      },
      error: (err: HttpErrorResponse) => this.falloVerificacion(err),
    });
  }

  protected verificar(): void {
    if (this.codigo.invalid) {
      this.codigo.markAsTouched();
      this.error.set('Escribe los 6 dígitos del código.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.auth.verificarCodigo(this.desafio(), this.codigo.value).subscribe({
      next: () => this.router.navigate([this.auth.rutaInicial()]),
      error: (err: HttpErrorResponse) => this.falloVerificacion(err),
    });
  }

  /** Vuelve al formulario de contraseña (por ejemplo, si el desafío venció). */
  protected volver(): void {
    this.paso.set('credenciales');
    this.desafio.set('');
    this.aviso.set('');
    this.form.controls.password.reset();
  }

  private falloVerificacion(err: HttpErrorResponse): void {
    this.cargando.set(false);
    const validacion = err.error?.errors ? Object.values(err.error.errors as Record<string, string[]>)[0]?.[0] : null;
    this.error.set(err.error?.mensaje ?? validacion ?? 'No se pudo completar la verificación');
    // 403: el desafío venció o hubo demasiados códigos incorrectos; hay que empezar de nuevo.
    if (err.status === 403) this.volver();
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
