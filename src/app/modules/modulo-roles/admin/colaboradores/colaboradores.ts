import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';

import { Colaborador } from '../../../../core/models/colaborador.model';
import { ColaboradorService } from '../../../../core/services/colaborador.service';

/** Solicitudes de psicólogos que quieren colaborar: el administrador las aprueba (crea su cuenta) o las rechaza. */
@Component({
  selector: 'app-colaboradores',
  standalone: false,
  templateUrl: './colaboradores.html',
  styleUrl: './colaboradores.scss',
})
export class Colaboradores {
  private readonly colaboradorService = inject(ColaboradorService);

  protected readonly colaboradores = signal<Colaborador[]>([]);
  protected readonly filtro = signal('');
  protected readonly cargando = signal(true);
  protected readonly trabajandoEn = signal<number | null>(null);
  protected readonly rechazando = signal<number | null>(null);
  protected readonly motivo = signal('');
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  protected readonly pendientes = computed(
    () => this.colaboradores().filter((c) => c.estado === 'Pendiente').length,
  );

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.colaboradorService.listar(this.filtro()).subscribe({
      next: (lista) => {
        this.colaboradores.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes');
        this.cargando.set(false);
      },
    });
  }

  protected filtrar(estado: string): void {
    this.filtro.set(estado);
    this.cargar();
  }

  protected aprobar(c: Colaborador): void {
    this.trabajandoEn.set(c.id);
    this.aviso.set('');
    this.error.set('');

    this.colaboradorService.aprobar(c.id).subscribe({
      next: () => {
        this.aviso.set(`${c.nombre} ya es psicólogo/a: se creó su cuenta y se le avisó por correo.`);
        this.trabajandoEn.set(null);
        this.cargar();
      },
      error: (err) => this.fallo(err),
    });
  }

  protected abrirRechazo(c: Colaborador): void {
    this.rechazando.set(c.id);
    this.motivo.set('');
  }

  protected confirmarRechazo(c: Colaborador): void {
    this.trabajandoEn.set(c.id);
    this.aviso.set('');
    this.error.set('');

    this.colaboradorService.rechazar(c.id, this.motivo()).subscribe({
      next: () => {
        this.aviso.set(`Se rechazó la solicitud de ${c.nombre}.`);
        this.trabajandoEn.set(null);
        this.rechazando.set(null);
        this.cargar();
      },
      error: (err) => this.fallo(err),
    });
  }

  private fallo(err: HttpErrorResponse): void {
    this.trabajandoEn.set(null);
    this.error.set(
      err.status === 409 ? 'Esa solicitud ya fue revisada o el correo ya tiene cuenta.' : 'No se pudo completar la acción',
    );
    this.cargar();
  }
}
