import { Component, computed, inject, input } from '@angular/core';

import { AuthService } from '../../Services/auth.service';
import { SitioService } from '../../Services/sitio.service';

interface ItemPortal {
  ruta: string;
  etiqueta: string;
  icono: string;
  exacto?: boolean;
}

/**
 * Marco del portal de miembros (diseño "Portal del practicante"): menú lateral verde y el contenido.
 * El tipo llega desde el "data" de la ruta: el practicante tiene además horario y asistencia.
 */
@Component({
  selector: 'app-portal-miembro',
  standalone: false,
  templateUrl: './com-portal-miembro.html',
  styleUrl: './com-portal-miembro.scss',
})
export class PortalMiembro {
  protected readonly auth = inject(AuthService);

  readonly tipo = input<'Practicante' | 'Voluntario'>('Voluntario');

  protected readonly base = computed(() => (this.tipo() === 'Practicante' ? '/practicante' : '/voluntario'));

  protected readonly menu = computed<ItemPortal[]>(() => {
    const b = this.base();
    const comunes: ItemPortal[] = [
      { ruta: `${b}/mis-iniciativas`, etiqueta: 'Mis iniciativas', icono: 'diversity_2' },
      { ruta: `${b}/mi-cuenta`, etiqueta: 'Mi cuenta y seguridad', icono: 'lock_reset' },
    ];
    return this.tipo() === 'Practicante'
      ? [
          { ruta: b, etiqueta: 'Mi perfil', icono: 'person', exacto: true },
          { ruta: `${b}/horario`, etiqueta: 'Mi horario', icono: 'schedule' },
          { ruta: `${b}/tareas`, etiqueta: 'Actividades', icono: 'assignment' },
          { ruta: `${b}/asistencia`, etiqueta: 'Asistencia', icono: 'fact_check' },
          ...comunes,
        ]
      : [{ ruta: b, etiqueta: 'Mi perfil y actividades', icono: 'person', exacto: true }, ...comunes];
  });

  protected readonly iniciales = computed(() =>
    (this.auth.sesion()?.nombre || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join(''),
  );

  constructor() {
    inject(SitioService).cargar();
  }
}
