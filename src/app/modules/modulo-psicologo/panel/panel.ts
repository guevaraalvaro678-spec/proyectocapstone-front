import { Component, computed, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

/** Marco del panel del psicólogo: menú lateral, cabecera y el contenido de cada sección. */
@Component({
  selector: 'app-panel-psicologo',
  standalone: false,
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
})
export class Panel {
  protected readonly auth = inject(AuthService);

  protected readonly menu = [
    { ruta: 'resumen', etiqueta: 'Resumen', icono: '🏠' },
    { ruta: 'citas', etiqueta: 'Mis citas', icono: '📅' },
    { ruta: 'horarios', etiqueta: 'Mis horarios', icono: '🕒' },
    { ruta: 'solicitudes', etiqueta: 'Solicitudes', icono: '📝' },
  ];

  protected readonly inicial = computed(() => (this.auth.sesion()?.nombre ?? '?').charAt(0).toUpperCase());

  protected readonly fecha = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}
