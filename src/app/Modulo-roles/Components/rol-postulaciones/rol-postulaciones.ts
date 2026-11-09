import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import {
  COLOR_POSTULACION,
  ESTADOS_POSTULACION,
  ETIQUETA_POSTULACION,
  EstadoPostulacion,
  Postulacion,
  PostulacionResumen,
  ResultadoMasivo,
  SesionEntrevista,
} from '../../../Modulo-compartido/Models/postulacion.model';
import { PostulacionService } from '../../../Modulo-compartido/Services/postulacion.service';

/**
 * Postulaciones: el equipo revisa a cada postulante y lo avanza en el proceso
 * (agendar entrevista → entrevista realizada → aceptar o no admitir), una por una o varias a la vez.
 */
@Component({
  selector: 'app-postulaciones',
  standalone: false,
  templateUrl: './rol-postulaciones.html',
  styleUrl: './rol-postulaciones.scss',
})
export class Postulaciones {
  private readonly postulacionService = inject(PostulacionService);

  protected readonly estados = ESTADOS_POSTULACION;
  protected readonly etiquetas = ETIQUETA_POSTULACION;
  protected readonly colores = COLOR_POSTULACION;

  protected readonly buscar = new FormControl('', { nonNullable: true });
  protected readonly tipo = signal('');
  protected readonly estado = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('estado') ?? '');

  protected readonly postulaciones = signal<Postulacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  // ---- Detalle (cajón lateral) ----
  protected readonly detalle = signal<Postulacion | null>(null);
  protected readonly sesiones = signal<SesionEntrevista[]>([]);
  protected readonly sesionElegida = signal<number>(0);
  protected readonly nota = signal('');
  protected readonly trabajando = signal(false);
  protected readonly errorDetalle = signal('');

  /** Sesiones que el backend marca como disponibles (o la que ya tiene asignada). */
  protected readonly sesionesDisponibles = computed(() =>
    this.sesiones().filter((s) => s.disponible || s.id === this.detalle()?.sesion?.id),
  );

  /** Indicadores con los filtros aplicados: los calcula el backend (GET api/postulacion/resumen). */
  protected readonly indicadores = signal<PostulacionResumen>({
    total: 0, recibidas: 0, habilitadas: 0, agendadas: 0, enProceso: 0, aceptadas: 0, noAdmitidas: 0, requierenAtencion: 0,
  });

  // ---- Selección múltiple ----
  protected readonly seleccion = signal<ReadonlySet<number>>(new Set());
  protected readonly sesionMasiva = signal<number>(0);
  protected readonly notaMasiva = signal('');
  protected readonly erroresMasivos = signal<ResultadoMasivo['errores']>([]);

  protected readonly textoAccion: Record<EstadoPostulacion, string> = {
    Recibida: 'Volver a recibida',
    HabilitadaEntrevista: 'Habilitar para entrevista',
    EntrevistaAgendada: 'Agendar en la sesión',
    EntrevistaRealizada: 'Entrevista realizada',
    EnCalificacion: 'Pasar a calificación',
    Aceptada: 'Aceptar',
    NoAdmitida: 'No admitir',
  };

  protected readonly seleccionadas = computed(() => this.postulaciones().filter((p) => this.seleccion().has(p.id)));

  /** Pasos que el backend permite a todas las seleccionadas a la vez. */
  protected readonly accionesComunes = computed(() => {
    const lista = this.seleccionadas();
    if (lista.length === 0) return [];
    return lista[0].acciones.filter((a) => lista.every((p) => p.acciones.includes(a)));
  });

  protected readonly todasMarcadas = computed(() => {
    const conAcciones = this.postulaciones().filter((p) => p.acciones.length > 0);
    return conAcciones.length > 0 && conAcciones.every((p) => this.seleccion().has(p.id));
  });

  protected marcar(id: number, marcada: boolean): void {
    const nueva = new Set(this.seleccion());
    if (marcada) nueva.add(id);
    else nueva.delete(id);
    this.seleccion.set(nueva);
    if (marcada && this.sesiones().length === 0) {
      this.postulacionService.listarSesiones('Programada').subscribe((s) => this.sesiones.set(s));
    }
  }

  protected marcarTodas(marcada: boolean): void {
    this.seleccion.set(new Set(marcada ? this.postulaciones().filter((p) => p.acciones.length > 0).map((p) => p.id) : []));
    if (marcada && this.sesiones().length === 0) {
      this.postulacionService.listarSesiones('Programada').subscribe((s) => this.sesiones.set(s));
    }
  }

  protected moverVarias(estado: EstadoPostulacion): void {
    const ids = [...this.seleccion()];
    if (ids.length === 0) return;
    if ((estado === 'Aceptada' || estado === 'NoAdmitida') && !confirm(`¿${this.textoAccion[estado]} ${ids.length} postulación(es)? Se les avisará por correo.`)) {
      return;
    }

    this.trabajando.set(true);
    this.error.set('');
    this.erroresMasivos.set([]);
    this.postulacionService
      .cambiarEstadoVarias(ids, {
        estado,
        sesionEntrevistaId: estado === 'EntrevistaAgendada' ? this.sesionMasiva() || null : null,
        notaEvaluacion: this.notaMasiva() || undefined,
      })
      .subscribe({
        next: (r) => {
          this.trabajando.set(false);
          this.aviso.set(`${r.procesadas} postulación(es) pasaron a "${this.etiquetas[estado]}".`);
          this.erroresMasivos.set(r.errores);
          this.seleccion.set(new Set(r.errores.map((e) => e.id)));
          this.notaMasiva.set('');
          this.cargar();
          this.postulacionService.listarSesiones('Programada').subscribe((s) => this.sesiones.set(s));
        },
        error: (err: HttpErrorResponse) => {
          this.trabajando.set(false);
          const validacion = err.error?.errors ? Object.values(err.error.errors as Record<string, string[]>)[0]?.[0] : null;
          this.error.set(err.error?.mensaje ?? validacion ?? 'No se pudieron actualizar las postulaciones');
        },
      });
  }

  /** El backend dice a qué estados puede pasar la postulación abierta; el panel muestra esos botones. */
  protected puede(estado: EstadoPostulacion): boolean {
    return this.detalle()?.acciones?.includes(estado) ?? false;
  }

  constructor() {
    this.buscar.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.cargar());
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.postulacionService.listar(this.tipo(), this.estado(), this.buscar.value).subscribe({
      next: (lista) => {
        this.postulaciones.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las postulaciones');
        this.cargando.set(false);
      },
    });
    this.postulacionService.resumen(this.tipo(), this.estado(), this.buscar.value).subscribe((r) => this.indicadores.set(r));
  }

  protected filtrarTipo(valor: string): void {
    this.tipo.set(valor);
    this.cargar();
  }

  protected filtrarEstado(valor: string): void {
    this.estado.set(valor);
    this.cargar();
  }

  protected limpiar(): void {
    this.seleccion.set(new Set());
    this.tipo.set('');
    this.estado.set('');
    this.buscar.setValue('', { emitEvent: false });
    this.cargar();
  }

  /** Descarga el CSV que arma el backend con los filtros actuales (se abre en Excel). */
  protected exportar(): void {
    this.postulacionService.exportar(this.tipo(), this.estado(), this.buscar.value).subscribe({
      next: (archivo) => {
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(archivo);
        enlace.download = `postulaciones_${new Date().toISOString().slice(0, 10)}.csv`;
        enlace.click();
        URL.revokeObjectURL(enlace.href);
      },
      error: () => this.error.set('No se pudo exportar la lista'),
    });
  }

  protected abrir(p: Postulacion): void {
    this.errorDetalle.set('');
    this.nota.set(p.notaEvaluacion ?? '');
    this.sesionElegida.set(p.sesion?.id ?? 0);
    this.detalle.set(p);

    // Datos completos (nombre del CV) y sesiones disponibles para agendar.
    this.postulacionService.obtener(p.id).subscribe((completa) => this.detalle.set(completa));
    this.postulacionService.listarSesiones('Programada').subscribe((s) => this.sesiones.set(s));
  }

  protected cerrar(): void {
    this.detalle.set(null);
  }

  protected verCv(p: Postulacion): void {
    if (!p.cvArchivoId) return;
    this.postulacionService.descargarArchivo(p.cvArchivoId).subscribe({
      next: (blob) => window.open(URL.createObjectURL(blob), '_blank'),
      error: () => this.errorDetalle.set('No se pudo abrir el CV'),
    });
  }

  protected mover(estado: EstadoPostulacion): void {
    const p = this.detalle();
    if (!p) return;

    // Las reglas (sesión obligatoria, pasos permitidos) las valida el backend y su mensaje se muestra abajo.
    this.trabajando.set(true);
    this.errorDetalle.set('');
    this.postulacionService
      .cambiarEstado(p.id, {
        estado,
        sesionEntrevistaId: estado === 'EntrevistaAgendada' ? this.sesionElegida() || null : null,
        notaEvaluacion: this.nota() || undefined,
      })
      .subscribe({
        next: (actualizada) => {
          this.trabajando.set(false);
          this.detalle.set(actualizada);
          this.aviso.set(`${actualizada.codigo}: ${this.etiquetas[actualizada.estado]}.`);
          this.cargar();
          if (estado === 'EntrevistaAgendada') {
            this.postulacionService.listarSesiones('Programada').subscribe((s) => this.sesiones.set(s));
          }
        },
        error: (err: HttpErrorResponse) => {
          this.trabajando.set(false);
          this.errorDetalle.set(err.error?.mensaje ?? 'No se pudo actualizar la postulación');
        },
      });
  }
}
