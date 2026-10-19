import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Postulacion, PostulacionCrear, TipoPostulacion } from '../../../Modulo-compartido/Models/postulacion.model';
import { AuthService } from '../../../Modulo-compartido/Services/auth.service';
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
  private readonly google = inject(GoogleService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  /** Áreas a las que se puede postular: vienen del backend. */
  protected readonly areas = signal<string[]>([]);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly anterior = signal<Postulacion | null>(null);

  /** CV elegido; se envía junto con el formulario. */
  private readonly cvPorSubir = signal<File | null>(null);
  protected readonly nombreCv = computed(() => this.cvPorSubir()?.name ?? null);

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
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
    // Solo practicantes (para voluntarios estos campos se desactivan y no se envían).
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    fechaNacimiento: ['', Validators.required],
    direccion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    distrito: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    provincia: ['Lima', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    universidad: ['', [Validators.required, Validators.maxLength(150)]],
    carrera: ['', [Validators.required, Validators.maxLength(100)]],
    ciclo: ['', [Validators.required, Validators.maxLength(30)]],
    departamento: ['', Validators.required],
    departamentoSecundario: [''],
    participaIniciativa: [null as boolean | null, Validators.required],
    iniciativaDescripcion: ['', Validators.maxLength(600)],
  });

  private static readonly camposPracticante = [
    'dni', 'fechaNacimiento', 'direccion', 'distrito', 'provincia', 'universidad', 'carrera', 'ciclo',
    'departamento', 'departamentoSecundario', 'participaIniciativa', 'iniciativaDescripcion',
  ] as const;

  private readonly tipo = signal<TipoPostulacion>('Voluntario');
  protected readonly esPracticante = computed(() => this.tipo() === 'Practicante');

  constructor() {
    const tipo = inject(ActivatedRoute).snapshot.queryParamMap.get('tipo');
    this.elegirTipo(tipo === 'Practicante' ? 'Practicante' : 'Voluntario');
    this.postulacionService.areas().subscribe((a) => this.areas.set(a));

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

    // Al voluntario solo se le piden nombres, apellidos y teléfono: el resto se desactiva.
    for (const campo of Postular.camposPracticante) {
      const control = this.form.controls[campo];
      if (tipo === 'Practicante') control.enable();
      else control.disable();
    }
  }

  /** El archivo se guarda aquí y viaja con el formulario; el backend valida tipo y tamaño. */
  protected elegirCv(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
    this.error.set('');
    this.cvPorSubir.set(archivo);
  }

  /**
   * Un solo envío: el backend crea la cuenta si hace falta (Google o correo y contraseña), guarda el CV
   * y registra la postulación en la misma transacción. Las reglas y sus mensajes vienen del backend.
   */
  protected enviar(): void {
    // El CV solo lo envía el practicante.
    const archivo = this.esPracticante() ? this.cvPorSubir() : null;
    if (this.form.invalid || (this.esPracticante() && !archivo)) {
      this.form.markAllAsTouched();
      this.error.set(this.form.valid ? 'Adjunta tu CV en PDF.' : 'Revisa los campos marcados.');
      return;
    }

    const cuenta = this.formCuenta.getRawValue();
    if (this.sinCuenta() && !this.conGoogle() && cuenta.password !== cuenta.confirmar) {
      this.error.set('Las dos contraseñas no coinciden.');
      return;
    }

    this.enviando.set(true);
    this.error.set('');

    const credencial = this.google.credencialPendiente();
    const datosCuenta = !this.sinCuenta()
      ? undefined
      : credencial
        ? { googleCredential: credencial, aceptaTerminos: this.acepto() }
        : { correo: cuenta.correo, password: cuenta.password, aceptaTerminos: this.acepto() };

    this.postulacionService.enviarCompleta(this.datos(), archivo, datosCuenta).subscribe({
      next: (r) => {
        this.quitarGoogle();
        // Ese correo ya era de un voluntario o practicante: va a su portal.
        if (r.esMiembro) {
          void this.router.navigate([this.auth.rutaInicial()]);
          return;
        }
        this.auth.actualizarNombre(this.form.controls.nombres.value);
        void this.router.navigate(['/mi-postulacion']);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo enviar la postulación.');
      },
    });
  }

  private datos(): PostulacionCrear {
    const v = this.form.getRawValue();
    const basicos: PostulacionCrear = { tipo: v.tipo, nombres: v.nombres, apellidos: v.apellidos, telefono: v.telefono };
    if (v.tipo !== 'Practicante') return basicos;

    return {
      ...basicos,
      dni: v.dni,
      fechaNacimiento: v.fechaNacimiento,
      direccion: v.direccion,
      distrito: v.distrito,
      provincia: v.provincia,
      universidad: v.universidad,
      carrera: v.carrera,
      ciclo: v.ciclo,
      departamento: v.departamento,
      departamentoSecundario: v.departamentoSecundario || undefined,
      participaIniciativa: !!v.participaIniciativa,
      iniciativaDescripcion: v.participaIniciativa ? v.iniciativaDescripcion || undefined : undefined,
    };
  }

  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.touched && c.invalid;
  }
}
