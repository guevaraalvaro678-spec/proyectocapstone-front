import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../../Modulo-compartido/Services/auth.service';
import { SitioService } from '../../../Modulo-compartido/Services/sitio.service';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
  soloSuperAdmin?: boolean;
  /** Sin marcar, también lo ve Recursos Humanos. */
  soloAdmin?: boolean;
}

interface GrupoMenu {
  titulo: string;
  items: ItemMenu[];
}

/** Panel de gestión (administración y Recursos Humanos): menú lateral por secciones, como en el diseño. */
@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './rol-admin.html',
  styleUrl: './rol-admin.scss',
})
export class Admin {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly menuAbierto = signal(false);
  protected readonly rutaActual = signal(this.router.url);

  private readonly grupos: GrupoMenu[] = [
    {
      titulo: 'Principal',
      items: [{ ruta: 'dashboard', etiqueta: 'Dashboard', icono: 'dashboard', soloAdmin: true }],
    },
    {
      titulo: 'Selección y miembros',
      items: [
        { ruta: 'postulaciones', etiqueta: 'Postulaciones', icono: 'how_to_reg' },
        { ruta: 'entrevistas', etiqueta: 'Entrevistas', icono: 'event_available' },
        { ruta: 'miembros', etiqueta: 'Miembros', icono: 'group' },
        { ruta: 'horarios', etiqueta: 'Horarios de prácticas', icono: 'schedule' },
        { ruta: 'tareas', etiqueta: 'Actividades', icono: 'assignment' },
        { ruta: 'asistencia', etiqueta: 'Asistencia', icono: 'fact_check' },
      ],
    },
    {
      titulo: 'Gestión institucional',
      items: [
        { ruta: 'campanas', etiqueta: 'Campañas y eventos', icono: 'campaign', soloAdmin: true },
        { ruta: 'iniciativas', etiqueta: 'Iniciativas', icono: 'diversity_2', soloAdmin: true },
        { ruta: 'noticias', etiqueta: 'Noticias', icono: 'newspaper', soloAdmin: true },
        { ruta: 'donaciones', etiqueta: 'Donaciones', icono: 'volunteer_activism', soloAdmin: true },
      ],
    },
    {
      titulo: 'Administración',
      items: [
        { ruta: 'usuarios', etiqueta: 'Usuarios y roles', icono: 'manage_accounts', soloAdmin: true },
        { ruta: 'administradores', etiqueta: 'Administradores', icono: 'admin_panel_settings', soloSuperAdmin: true },
        { ruta: 'mensajes', etiqueta: 'Mensajes', icono: 'mail', soloAdmin: true },
        { ruta: 'correos', etiqueta: 'Correos', icono: 'forward_to_inbox', soloAdmin: true },
        { ruta: 'configuracion', etiqueta: 'Configuración', icono: 'settings', soloAdmin: true },
      ],
    },
  ];

  /** Grupos con solo los ítems que la cuenta puede ver. */
  protected readonly menu = computed(() =>
    this.grupos
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) => (!i.soloSuperAdmin || this.auth.esSuperAdmin()) && (!i.soloAdmin || this.auth.esAdmin()),
        ),
      }))
      .filter((g) => g.items.length > 0),
  );

  /** Nombre de la sección abierta, para la miga de pan de la barra superior. */
  protected readonly seccionActual = computed(() => {
    const ruta = this.rutaActual().split('?')[0].split('/')[2] ?? '';
    if (ruta === 'mi-cuenta') return 'Mi cuenta y seguridad';
    return this.grupos.flatMap((g) => g.items).find((i) => i.ruta === ruta)?.etiqueta ?? '';
  });

  protected readonly iniciales = computed(() =>
    (this.auth.sesion()?.nombre || this.auth.sesion()?.usuario || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join(''),
  );

  protected readonly nombreRol = computed(() =>
    this.auth.esSuperAdmin() ? 'Super administrador' : this.auth.esRRHH() ? 'Recursos Humanos' : 'Administrador',
  );

  constructor() {
    inject(SitioService).cargar();

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.rutaActual.set((e as NavigationEnd).urlAfterRedirects);
      this.menuAbierto.set(false);
    });
  }
}
