import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { ParticipanteService } from '../../../Modulo-compartido/Services/participante.service';

interface Miembro {
  usuarioId: number;
  dni: string;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  tipo: 'Voluntario' | 'Practicante';
  departamento: string;
  detalle: string;
  activo: boolean;
  fechaRegistro: string;
}

/** Miembros: voluntarios y practicantes que forman parte de AMAAC (incorporados al aceptar su postulación). */
@Component({
  selector: 'app-miembros',
  standalone: false,
  templateUrl: './rol-miembros.html',
  styleUrl: './rol-miembros.scss',
})
export class Miembros {
  private readonly participantes = inject(ParticipanteService);

  protected readonly miembros = signal<Miembro[]>([]);
  protected readonly buscar = signal('');
  protected readonly tipo = signal('');
  protected readonly estado = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly filtrados = computed(() => {
    const texto = this.buscar().trim().toLowerCase();
    return this.miembros().filter(
      (m) =>
        (!this.tipo() || m.tipo === this.tipo()) &&
        (!this.estado() || (this.estado() === 'activo') === m.activo) &&
        (!texto || `${m.nombre} ${m.dni} ${m.correo ?? ''}`.toLowerCase().includes(texto)),
    );
  });

  protected readonly indicadores = computed(() => {
    const lista = this.miembros();
    const activos = lista.filter((m) => m.activo);
    return {
      total: lista.length,
      activos: activos.length,
      voluntarios: activos.filter((m) => m.tipo === 'Voluntario').length,
      practicantes: activos.filter((m) => m.tipo === 'Practicante').length,
      inactivos: lista.length - activos.length,
    };
  });

  protected readonly pctVoluntarios = computed(() => {
    const i = this.indicadores();
    return i.activos ? Math.round((i.voluntarios / i.activos) * 100) : 0;
  });

  constructor() {
    forkJoin([this.participantes.listarVoluntarios(), this.participantes.listarPracticantes()]).subscribe({
      next: ([voluntarios, practicantes]) => {
        const lista: Miembro[] = [
          ...voluntarios.map((v) => ({
            usuarioId: v.usuarioId,
            dni: v.dni,
            nombre: `${v.nombre} ${v.apellidos}`.trim(),
            correo: v.correo,
            telefono: v.telefono,
            tipo: 'Voluntario' as const,
            departamento: '—',
            detalle: 'Voluntariado',
            activo: v.activo,
            fechaRegistro: v.fechaRegistro,
          })),
          ...practicantes.map((p) => ({
            usuarioId: p.usuarioId,
            dni: p.dni,
            nombre: `${p.nombre} ${p.apellidos}`.trim(),
            correo: p.correo,
            telefono: p.telefono,
            tipo: 'Practicante' as const,
            departamento: p.departamentoPrincipal,
            detalle: `${p.universidad} · ${p.carrera}`,
            activo: p.activo,
            fechaRegistro: p.fechaRegistro,
          })),
        ];
        lista.sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro));
        this.miembros.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los miembros');
        this.cargando.set(false);
      },
    });
  }

  protected limpiar(): void {
    this.buscar.set('');
    this.tipo.set('');
    this.estado.set('');
  }
}
