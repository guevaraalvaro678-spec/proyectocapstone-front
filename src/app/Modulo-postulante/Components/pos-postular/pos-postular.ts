import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, of, switchMap } from 'rxjs';

import { AREAS, ArchivoSubido, Postulacion, PostulacionCrear, TipoPostulacion } from '../../../Modulo-compartido/Models/postulacion.model';
import { AuthService } from '../../../Modulo-compartido/Services/auth.service';
import { CuentaService } from '../../../Modulo-compartido/Services/cuenta.service';
import { GoogleService } from '../../../Modulo-compartido/Services/google.service';
import { PostulacionService } from '../../../Modulo-compartido/Services/postulacion.service';

/**
 * "Postula a AMAAC Perú": modalidad (voluntario o practicante), datos personales, formación,
 * área, CV en PDF y participación en iniciativas. Al enviarla se pasa al seguimiento.
 * Si llegó con "Continuar con Google" sin cuenta, sus datos vienen precargados y la cuenta se crea al enviar.
 */
@Component({
  selector: 'app-postular',
  standalone: false,
  templateUrl: './pos-postular.html',
  styleUrl: './pos-postular.scss',
})
export class Postular {
  private readonly fb = inject(FormBuilder);
  private readonly postulacionService = inject(PostulacionService);
  private readonly cuentaService = inject(CuentaService);
  private readonly google = inject(GoogleService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly areas = AREAS;
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly subiendoCv = signal(false);
  protected readonly error = signal('');
  protected readonly anterior = signal<Postulacion | null>(null);

  /** CV ya subido (con cuenta) o elegido y por subir (sin cuenta todavía). */
  protected readonly cv = signal<ArchivoSubido | null>(null);
  private readonly cvPorSubir = signal<File | null>(null);
  protected readonly nombreCv = computed(() => this.cv()?.nombre ?? this.cvPorSubir()?.name ?? null);

  /** Todavía no tiene cuenta: la crea al final con Google o con correo y contraseña. */
  protected readonly sinCuenta = computed(() => !this.auth.autenticado());
  protected readonly perfilGoogle = this.google.perfilPendiente;
  protected readonly conGoogle = computed(() => !!this.google.credencialPendiente());
  protected readonly correo = computed(() => this.auth.sesion()?.usuario ?? this.perfilGoogle()?.correo ?? '');
  protected readonly acepto = signal(false);
  private readonly botonGoogle = viewChild<ElementRef<HTMLElement>>('botonGoogle');

  protected readonly formCuenta = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    confirmar: ['', Validators.required],
  });

  protected readonly form = this.fb.nonNullable.group({
    tipo: ['Voluntario' as TipoPostulacion, Validators.required],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    fechaNacimiento: ['', Validators.required],
    direccion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    distrito: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    provincia: ['Lima', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
    universidad: ['', Validators.maxLength(150)],
    carrera: ['', Validators.maxLength(100)],
    ciclo: ['', Validators.maxLength(30)],
    departamento: ['', Validators.required],
    departamentoSecundario: [''],
    participaIniciativa: [null as boolean | null, Validators.required],
    iniciativaDescripcion: ['', Validators.maxLength(600)],
  });

  private readonly tipo = signal<TipoPostulacion>('Voluntario');
  protected readonly esPracticante = computed(() => this.tipo() === 'Practicante');

  constructor() {
    const tipo = inject(ActivatedRoute).snapshot.queryParamMap.get('tipo');
    if (tipo === 'Voluntario' || tipo === 'Practicante') this.elegirTipo(tipo);

    if (this.sinCuenta()) {
      void this.google.preparar();
      // Dibuja "Únete con Google" cuando el contenedor aparece en pantalla.
      effect(() => {
        const contenedor = this.botonGoogle()?.nativeElement;
        if (contenedor && this.google.disponible()) this.google.dibujarBoton(contenedor, (c) => this.unirConGoogle(c));
      });
      this.precargarGoogle();
      this.cargando.set(false);
      return;
    }

    // Si ya tiene una postulación en curso, va directo a su seguimiento.
    this.postulacionService.obtenerMia().subscribe({
      next: (p) => {
        if (p && p.estado !== 'NoAdmitida') {
          void this.router.navigate(['/mi-postulacion']);
          return;
        }
        this.anterior.set(p);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  /** Google solo pide permiso para el nombre y el correo: con eso se completan los datos y la cuenta queda vinculada. */
  private unirConGoogle(credential: string): void {
    this.error.set('');
    this.google.perfil(credential).subscribe({
      next: (perfil) => {
        this.google.credencialPendiente.set(credential);
        this.google.perfilPendiente.set(perfil);
        this.precargarGoogle();
      },
      error: (err: HttpErrorResponse) => this.error.set(err.error?.mensaje ?? 'No se pudo usar tu cuenta de Google'),
    });
  }

  private precargarGoogle(): void {
    const perfil = this.perfilGoogle();
    if (!perfil) return;
    if (!this.form.controls.nombres.value) this.form.patchValue({ nombres: perfil.nombres });
    if (!this.form.controls.apellidos.value) this.form.patchValue({ apellidos: perfil.apellidos });
  }

  protected quitarGoogle(): void {
    this.google.credencialPendiente.set(null);
    this.google.perfilPendiente.set(null);
  }

  protected elegirTipo(tipo: TipoPostulacion): void {
    this.tipo.set(tipo);
    this.form.controls.tipo.setValue(tipo);

    // La formación académica es obligatoria solo para practicantes.
    for (const campo of ['universidad', 'carrera', 'ciclo'] as const) {
      const control = this.form.controls[campo];
      control.setValidators(tipo === 'Practicante' ? [Validators.required, Validators.maxLength(150)] : [Validators.maxLength(150)]);
      control.updateValueAndValidity();
    }
  }

  protected elegirCv(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;

    if (archivo.type !== 'application/pdf') {
      this.error.set('El CV debe ser un archivo PDF.');
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      this.error.set('El CV pesa más de 10 MB.');
      return;
    }

    this.error.set('');

    // Sin cuenta todavía no se puede subir: se guarda y se sube al enviar.
    if (this.sinCuenta()) {
      this.cv.set(null);
      this.cvPorSubir.set(archivo);
      return;
    }

    this.subiendoCv.set(true);
    this.postulacionService.subirCv(archivo).subscribe({
      next: (subido) => {
        this.cv.set(subido);
        this.subiendoCv.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.subiendoCv.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo subir el CV');
      },
    });
  }

  protected enviar(): void {
    if (this.form.invalid || !this.nombreCv()) {
      this.form.markAllAsTouched();
      this.error.set(!this.nombreCv() ? 'Adjunta tu CV en PDF.' : 'Revisa los campos marcados.');
      return;
    }

    // Sin cuenta: hay que elegir Google o correo y contraseña, y aceptar los términos.
    const cuenta = this.formCuenta.getRawValue();
    if (this.sinCuenta()) {
      if (!this.conGoogle() && (this.formCuenta.invalid || cuenta.password !== cuenta.confirmar)) {
        this.formCuenta.markAllAsTouched();
        this.error.set('Crea tu cuenta al final: únete con Google o escribe tu correo y una contraseña (iguales en ambos campos).');
        return;
      }
      if (!this.acepto()) {
        this.error.set('Acepta los términos y el tratamiento de tus datos para continuar.');
        return;
      }
    }

    this.enviando.set(true);
    this.error.set('');

    // 1) Crear la cuenta (con Google queda vinculada) · 2) subir el CV · 3) enviar la postulación.
    const credencial = this.google.credencialPendiente();
    const crearCuenta$: Observable<unknown> = !this.sinCuenta()
      ? of(null)
      : credencial
        ? this.cuentaService.entrarConGoogle(credencial, true)
        : this.cuentaService.registrar(cuenta.correo, cuenta.password);

    const cvId$ = crearCuenta$.pipe(
      switchMap(() => {
        this.google.credencialPendiente.set(null);
        this.google.perfilPendiente.set(null);
        // Si ese correo ya era de un miembro, va a su espacio en vez de postular de nuevo.
        if (!this.auth.esPostulante()) throw new Error('miembro');
        const archivo = this.cvPorSubir();
        return archivo ? this.postulacionService.subirCv(archivo).pipe(map((s) => s.id)) : of(this.cv()!.id);
      }),
    );

    cvId$.pipe(switchMap((cvId) => this.postulacionService.crear(this.datos(cvId)))).subscribe({
      next: () => {
        this.auth.actualizarNombre(this.form.controls.nombres.value);
        void this.router.navigate(['/mi-postulacion']);
      },
      error: (err: HttpErrorResponse | Error) => {
        if (err instanceof Error && err.message === 'miembro') {
          void this.router.navigate([this.auth.rutaInicial()]);
          return;
        }
        this.enviando.set(false);
        const http = err as HttpErrorResponse;
        this.error.set(
          http.status === 409 && this.sinCuenta()
            ? 'Ese correo ya tiene una cuenta. Inicia sesión y vuelve a "Participar".'
            : (http.error?.mensaje ?? 'No se pudo enviar la postulación.'),
        );
      },
    });
  }

  private datos(cvArchivoId: number): PostulacionCrear {
    const v = this.form.getRawValue();
    return {
      tipo: v.tipo,
      dni: v.dni,
      nombres: v.nombres,
      apellidos: v.apellidos,
      fechaNacimiento: v.fechaNacimiento,
      direccion: v.direccion,
      distrito: v.distrito,
      provincia: v.provincia,
      telefono: v.telefono,
      universidad: v.universidad || undefined,
      carrera: v.carrera || undefined,
      ciclo: v.ciclo || undefined,
      departamento: v.departamento,
      departamentoSecundario: v.tipo === 'Practicante' ? v.departamentoSecundario || undefined : undefined,
      cvArchivoId,
      participaIniciativa: !!v.participaIniciativa,
      iniciativaDescripcion: v.participaIniciativa ? v.iniciativaDescripcion || undefined : undefined,
    };
  }

  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.touched && c.invalid;
  }
}
