import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';

import { PsicologoLista } from '../../../../core/models/psicologo.model';
import { ESTADOS_SOLICITUD, EstadoSolicitud, Solicitud } from '../../../../core/models/solicitud.model';
import { PsicologoService } from '../../../../core/services/psicologo.service';
import { SolicitudService } from '../../../../core/services/solicitud.service';

/** Lo que el administrador va eligiendo para una solicitud antes de guardar. */
interface Borrador {
  estado: EstadoSolicitud;
  /** 0 = ninguno elegido. */
  psicologoId: number;
}

/** Bandeja de solicitudes de orientación: el administrador las revisa, las asigna a un psicólogo y cambia su estado. */
@Component({
  selector: 'app-solicitudes',
  standalone: false,
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.scss',
})
export class Solicitudes {
  private readonly solicitudService = inject(SolicitudService);
  private readonly psicologoService = inject(PsicologoService);

  protected readonly estados = ESTADOS_SOLICITUD;
  protected readonly solicitudes = signal<Solicitud[]>([]);
  protected readonly psicologos = signal<PsicologoLista[]>([]);
  protected readonly borradores = signal<Record<number, Borrador>>({});
  protected readonly cargando = signal(true);
  protected readonly trabajandoEn = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  protected readonly pendientes = computed(() => this.solicitudes().filter((s) => s.estado === 'Pendiente').length);

  constructor() {
    this.psicologoService.listar('', true).subscribe((lista) => this.psicologos.set(lista));
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.solicitudService.listar().subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes);
        this.borradores.set(Object.fromEntries(solicitudes.map((s) => [s.id, this.borradorDe(s)])));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes.');
        this.cargando.set(false);
      },
    });
  }

  protected borrador(solicitud: Solicitud): Borrador {
    return this.borradores()[solicitud.id] ?? this.borradorDe(solicitud);
  }

  protected elegirEstado(solicitud: Solicitud, estado: string): void {
    this.actualizarBorrador(solicitud, { estado: estado as EstadoSolicitud });
  }

  protected elegirPsicologo(solicitud: Solicitud, psicologoId: string): void {
    this.actualizarBorrador(solicitud, { psicologoId: Number(psicologoId) });
  }

  /** Hay algo distinto a lo guardado que se pueda aplicar. */
  protected hayCambios(solicitud: Solicitud): boolean {
    const b = this.borrador(solicitud);
    const cambioEstado = b.estado !== solicitud.estado;
    const cambioPsicologo = b.estado === 'Asignada' && b.psicologoId !== (solicitud.psicologoAsignadoId ?? 0);
    return cambioEstado || cambioPsicologo;
  }

  protected guardar(solicitud: Solicitud): void {
    const b = this.borrador(solicitud);

    if (b.estado === 'Asignada' && !b.psicologoId) {
      this.error.set('Elige el psicólogo que atenderá la solicitud.');
      return;
    }

    this.trabajandoEn.set(solicitud.id);
    this.error.set('');
    this.aviso.set('');

    this.solicitudService.cambiarEstado(solicitud.id, b.estado, b.estado === 'Asignada' ? b.psicologoId : null).subscribe({
      next: (actualizada) => {
        this.solicitudes.update((lista) => lista.map((s) => (s.id === actualizada.id ? actualizada : s)));
        this.borradores.update((mapa) => ({ ...mapa, [actualizada.id]: this.borradorDe(actualizada) }));
        this.trabajandoEn.set(null);
        this.aviso.set(actualizada.estado === 'Pendiente' ? 'Solicitud actualizada.' : 'Solicitud actualizada. Se avisó al usuario por correo.');
      },
      error: (err: HttpErrorResponse) => {
        this.trabajandoEn.set(null);
        this.error.set(err.error?.mensaje ?? 'No se pudo cambiar el estado.');
      },
    });
  }

  private borradorDe(solicitud: Solicitud): Borrador {
    return { estado: solicitud.estado, psicologoId: solicitud.psicologoAsignadoId ?? 0 };
  }

  private actualizarBorrador(solicitud: Solicitud, cambios: Partial<Borrador>): void {
    this.borradores.update((mapa) => ({ ...mapa, [solicitud.id]: { ...this.borrador(solicitud), ...cambios } }));
  }
}
