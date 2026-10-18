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
  SesionEntrevista,
} from '../../../../core/models/postulacion.model';
import { PostulacionService } from '../../../../core/services/postulacion.service';

/**
 * Postulaciones: el equipo revisa a cada postulante y lo avanza en el proceso
 * (habilitar → agendar entrevista → entrevista realizada → calificación → aceptar o no admitir).
 */
@Component({
  selector: 'app-postulaciones',
  standalone: false,
  templateUrl: './postulaciones.html',
  styleUrl: './postulaciones.scss',
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

  /** Sesiones programadas que todavía tienen cupo (o la que ya tiene asignada). */
  protected readonly sesionesDisponibles = computed(() =>
    this.sesiones().filter((s) => s.inscritos < s.cupo || s.id === this.detalle()?.sesion?.id),
  );

  protected readonly indicadores = computed(() => {
    const lista = this.postulaciones();
    const contar = (...e: EstadoPostulacion[]) => lista.filter((p) => e.includes(p.estado)).length;
    return {
      total: lista.length,
      recibidas: contar('Recibida'),
      habilitadas: contar('HabilitadaEntrevista'),
      agendadas: contar('EntrevistaAgendada'),
      aceptadas: contar('Aceptada'),
      noAdmitidas: contar('NoAdmitida'),
      enProceso: contar('EntrevistaRealizada', 'EnCalificacion'),
    };
  });

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
    this.tipo.set('');
    this.estado.set('');
    this.buscar.setValue('', { emitEvent: false });
    this.cargar();
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

    if (estado === 'EntrevistaAgendada' && !this.sesionElegida()) {
      this.errorDetalle.set('Elige la sesión de entrevista.');
      return;
    }

    this.trabajando.set(true);
    this.errorDetalle.set('');
    this.postulacionService
      .cambiarEstado(p.id, {
        estado,
        sesionEntrevistaId: estado === 'EntrevistaAgendada' ? this.sesionElegida() : null,
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
