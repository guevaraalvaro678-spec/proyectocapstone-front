import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Cita } from '../../../core/models/cita.model';
import { ESTADOS_SOLICITUD, EstadoSolicitud, Solicitud } from '../../../core/models/solicitud.model';
import { UsuarioPerfil } from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';
import { SolicitudService } from '../../../core/services/solicitud.service';
import { UsuarioService } from '../../../core/services/usuario.service';

type Seccion = 'resumen' | 'reservar' | 'citas' | 'solicitud' | 'preferencias';

const SECCIONES: Seccion[] = ['resumen', 'reservar', 'citas', 'solicitud', 'preferencias'];

const PASOS: { estado: EstadoSolicitud; texto: string }[] = [
  { estado: 'Pendiente', texto: 'Solicitud recibida' },
  { estado: 'EnRevision', texto: 'En revisión' },
  { estado: 'Asignada', texto: 'Profesional asignado' },
];

const TITULOS_ESTADO: Record<EstadoSolicitud, string> = {
  Pendiente: 'Tu solicitud está en espera',
  EnRevision: 'Tu solicitud está en revisión',
  Asignada: 'Ya tienes un profesional asignado',
  Cerrada: 'Tu solicitud fue cerrada',
};

/** "Mi espacio" del usuario común: su perfil, su solicitud de orientación y sus preferencias. */
@Component({
  selector: 'app-mi-espacio',
  standalone: false,
  templateUrl: './mi-espacio.html',
  styleUrl: './mi-espacio.scss',
})
export class MiEspacio {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly citaService = inject(CitaService);
  protected readonly auth = inject(AuthService);

  protected readonly seccion = signal<Seccion>('resumen');
  protected readonly perfil = signal<UsuarioPerfil | null>(null);
  protected readonly solicitud = signal<Solicitud | null>(null);
  protected readonly citas = signal<Cita[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  protected readonly editando = signal(false);
  protected readonly nuevaSolicitud = signal(false);
  protected readonly guardando = signal(false);

  protected readonly pasos = PASOS;

  protected readonly primerNombre = computed(() => {
    const nombre = this.perfil()?.nombre ?? this.auth.sesion()?.nombre ?? '';
    return nombre.trim().split(' ')[0] || 'usuario';
  });

  protected readonly inicial = computed(() => this.primerNombre().charAt(0).toUpperCase());

  /** Nombre corto del estado para la tarjeta de indicadores. */
  protected readonly estadoCorto = computed(() => {
    const estado = this.solicitud()?.estado;
    return estado ? (ESTADOS_SOLICITUD.find((e) => e.valor === estado)?.texto ?? estado) : 'Sin solicitud';
  });

  /** Citas programadas o confirmadas que todavía no empiezan. */
  protected readonly citasPendientes = computed(
    () =>
      this.citas().filter(
        (c) => (c.estado === 'Programada' || c.estado === 'Confirmada') && new Date(c.fechaInicio).getTime() > Date.now(),
      ).length,
  );

  protected readonly tituloEstado = computed(() => {
    const solicitud = this.solicitud();
    return solicitud ? TITULOS_ESTADO[solicitud.estado] : 'Aún no has pedido orientación';
  });

  /** Posición del estado actual en la línea de tiempo (una solicitud cerrada cuenta como completa). */
  protected readonly pasoActual = computed(() => {
    const estado = this.solicitud()?.estado;
    if (!estado) return -1;
    if (estado === 'Cerrada') return PASOS.length;
    return PASOS.findIndex((p) => p.estado === estado);
  });

  /** Solo se puede pedir una nueva solicitud si no hay ninguna o la anterior ya se cerró. */
  protected readonly puedePedir = computed(() => {
    const solicitud = this.solicitud();
    return !solicitud || solicitud.estado === 'Cerrada';
  });

  protected readonly formPerfil = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    ubicacion: ['', Validators.maxLength(100)],
    intereses: ['', Validators.maxLength(200)],
  });

  protected readonly formSolicitud = this.fb.nonNullable.group({
    motivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  protected readonly formPreferencias = this.fb.nonNullable.group({
    recordatoriosCorreo: [true],
    preferenciaVirtual: [false],
  });

  constructor() {
    // Los enlaces del sitio y de los correos abren directo una sección: /mi-espacio?seccion=solicitud
    const inicial = inject(ActivatedRoute).snapshot.queryParamMap.get('seccion') as Seccion | null;
    if (inicial && SECCIONES.includes(inicial)) {
      this.seccion.set(inicial);
    }

    this.cargar();
  }

  protected cambiarSeccion(seccion: Seccion): void {
    this.seccion.set(seccion);
    this.aviso.set('');
    this.error.set('');
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.usuarioService.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.aplicarPerfil(perfil);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu perfil.');
        this.cargando.set(false);
      },
    });

    this.solicitudService.obtenerMia().subscribe({
      next: (solicitud) => this.solicitud.set(solicitud),
      error: () => this.error.set('No se pudo cargar tu solicitud.'),
    });

    this.citaService.listarMias().subscribe({
      next: (citas) => this.citas.set(citas),
      error: () => this.error.set('No se pudieron cargar tus citas.'),
    });
  }

  // ---- Citas ----

  /** Al reservar, la cita se suma a la lista y se lleva al paciente a "Mis citas". */
  protected alReservar(cita: Cita): void {
    this.citas.update((lista) => [...lista, cita]);
    this.seccion.set('citas');
    this.error.set('');
    this.aviso.set('¡Tu cita quedó reservada! Te enviamos los detalles por correo.');
  }

  protected alCancelar(cita: Cita): void {
    this.citas.update((lista) => lista.map((c) => (c.id === cita.id ? cita : c)));
    this.aviso.set('Tu cita fue cancelada.');
  }

  // ---- Datos personales ----

  protected editarPerfil(): void {
    this.aviso.set('');
    this.editando.set(true);
  }

  protected cancelarEdicion(): void {
    this.aplicarPerfil(this.perfil());
    this.editando.set(false);
  }

  protected guardarPerfil(): void {
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      return;
    }

    const { nombre, ubicacion, intereses } = this.formPerfil.getRawValue();
    this.actualizarPerfil(
      { nombre, ubicacion: ubicacion || null, intereses: intereses || null },
      () => {
        this.editando.set(false);
        this.aviso.set('Tus datos se guardaron correctamente.');
      },
    );
  }

  // ---- Preferencias ----

  protected guardarPreferencias(): void {
    this.actualizarPerfil({}, () => this.aviso.set('Tus preferencias se guardaron correctamente.'));
  }

  // ---- Solicitud de orientación ----

  protected mostrarFormularioSolicitud(): void {
    this.aviso.set('');
    this.nuevaSolicitud.set(true);
  }

  protected enviarSolicitud(): void {
    if (this.formSolicitud.invalid) {
      this.formSolicitud.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    this.aviso.set('');

    this.solicitudService.crear(this.formSolicitud.getRawValue().motivo).subscribe({
      next: (solicitud) => {
        this.solicitud.set(solicitud);
        this.nuevaSolicitud.set(false);
        this.formSolicitud.reset();
        this.guardando.set(false);
        this.aviso.set('Recibimos tu solicitud. Te avisaremos cuando avance.');
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(
          err.status === 409 ? 'Ya tienes una solicitud en curso.' : 'No se pudo enviar tu solicitud.',
        );
      },
    });
  }

  // ---- Internos ----

  private aplicarPerfil(perfil: UsuarioPerfil | null): void {
    if (!perfil) return;

    this.perfil.set(perfil);
    this.formPerfil.reset({
      nombre: perfil.nombre,
      ubicacion: perfil.ubicacion ?? '',
      intereses: perfil.intereses ?? '',
    });
    this.formPreferencias.reset({
      recordatoriosCorreo: perfil.recordatoriosCorreo,
      preferenciaVirtual: perfil.preferenciaVirtual,
    });
  }

  /** Envía el perfil completo al backend, mezclando lo que cambió con lo que ya estaba guardado. */
  private actualizarPerfil(
    cambios: { nombre?: string; ubicacion?: string | null; intereses?: string | null },
    alTerminar: () => void,
  ): void {
    const actual = this.perfil();
    if (!actual) return;

    this.guardando.set(true);
    this.error.set('');
    this.aviso.set('');

    const preferencias = this.formPreferencias.getRawValue();

    this.usuarioService
      .actualizarPerfil({
        nombre: cambios.nombre ?? actual.nombre,
        ubicacion: cambios.ubicacion !== undefined ? cambios.ubicacion : actual.ubicacion,
        intereses: cambios.intereses !== undefined ? cambios.intereses : actual.intereses,
        recordatoriosCorreo: preferencias.recordatoriosCorreo,
        preferenciaVirtual: preferencias.preferenciaVirtual,
      })
      .subscribe({
        next: (perfil) => {
          this.aplicarPerfil(perfil);
          this.auth.actualizarNombre(perfil.nombre);
          this.guardando.set(false);
          alTerminar();
        },
        error: () => {
          this.guardando.set(false);
          this.error.set('No se pudieron guardar los cambios.');
        },
      });
  }
}
