import { Component, computed, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
  soloSuperAdmin?: boolean;
  /** Sin marcar, también lo ve Recursos Humanos. */
  soloAdmin?: boolean;
}

/** Layout del panel de administrador: menú lateral, cabecera y el contenido de cada módulo. */
@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  protected readonly auth = inject(AuthService);

  private readonly menu: ItemMenu[] = [
    { ruta: 'dashboard', etiqueta: 'Dashboard', icono: '🏠', soloAdmin: true },
    { ruta: 'usuarios', etiqueta: 'Usuarios', icono: '🧑', soloAdmin: true },
    { ruta: 'practicantes', etiqueta: 'Practicantes', icono: '🎓' },
    { ruta: 'voluntarios', etiqueta: 'Voluntarios', icono: '🤝' },
    { ruta: 'tareas', etiqueta: 'Tareas', icono: '✅' },
    { ruta: 'asistencia', etiqueta: 'Asistencia', icono: '🕒' },
    { ruta: 'mensajes', etiqueta: 'Mensajes', icono: '✉️', soloAdmin: true },
    { ruta: 'correos', etiqueta: 'Correos', icono: '📧', soloAdmin: true },
    { ruta: 'eventos', etiqueta: 'Eventos', icono: '🎉', soloAdmin: true },
    { ruta: 'sitio', etiqueta: 'Sitio web', icono: '🖼️', soloAdmin: true },
    { ruta: 'administradores', etiqueta: 'Administradores', icono: '🔑', soloSuperAdmin: true },
    { ruta: 'reportes', etiqueta: 'Reportes', icono: '📊', soloAdmin: true },
    { ruta: 'configuracion', etiqueta: 'Configuración', icono: '⚙️', soloAdmin: true },
  ];

  protected readonly items = computed(() =>
    this.menu.filter(
      (item) => (!item.soloSuperAdmin || this.auth.esSuperAdmin()) && (!item.soloAdmin || this.auth.esAdmin()),
    ),
  );

  protected readonly inicial = computed(() =>
    (this.auth.sesion()?.usuario ?? '?').charAt(0).toUpperCase(),
  );

  protected readonly fecha = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
