import { Component, computed, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
  soloSuperAdmin?: boolean;
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
    { ruta: 'dashboard', etiqueta: 'Dashboard', icono: '🏠' },
    { ruta: 'usuarios', etiqueta: 'Usuarios', icono: '🔑', soloSuperAdmin: true },
    { ruta: 'pacientes', etiqueta: 'Pacientes', icono: '🧑' },
    { ruta: 'psicologos', etiqueta: 'Psicólogos', icono: '🩺' },
    { ruta: 'citas', etiqueta: 'Citas', icono: '📅' },
    { ruta: 'reportes', etiqueta: 'Reportes', icono: '📊' },
    { ruta: 'configuracion', etiqueta: 'Configuración', icono: '⚙️' },
  ];

  protected readonly items = computed(() =>
    this.menu.filter((item) => !item.soloSuperAdmin || this.auth.esSuperAdmin()),
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
