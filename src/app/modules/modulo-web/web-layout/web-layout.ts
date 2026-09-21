import { Component, computed, inject, signal } from '@angular/core';

import { ONG } from '../../../core/config/ong.config';
import { AuthService } from '../../../core/services/auth.service';
import { SitioService } from '../../../core/services/sitio.service';

/** Marco del sitio público: barra superior, contenido de cada página y pie de página. */
@Component({
  selector: 'app-web-layout',
  standalone: false,
  templateUrl: './web-layout.html',
  styleUrl: './web-layout.scss',
})
export class WebLayout {
  protected readonly auth = inject(AuthService);
  protected readonly ong = ONG;
  private readonly sitioService = inject(SitioService);
  protected readonly logoUrl = computed(() => this.sitioService.sitio().logoUrl);

  constructor() {
    this.sitioService.cargar();
  }

  private readonly todosLosEnlaces = [
    { ruta: '/', etiqueta: 'Inicio', exacto: true, soloVisitantes: false },
    { ruta: '/nosotros', etiqueta: 'Nosotros', exacto: false, soloVisitantes: false },
    { ruta: '/iniciativas', etiqueta: 'Iniciativas', exacto: false, soloVisitantes: false },
    // Quien ya inició sesión pide orientación desde su espacio, así que Contacto es solo para visitantes.
    { ruta: '/contacto', etiqueta: 'Contacto', exacto: false, soloVisitantes: true },
  ];

  protected readonly enlaces = computed(() =>
    this.todosLosEnlaces.filter((enlace) => !enlace.soloVisitantes || !this.auth.autenticado()),
  );

  protected readonly menuAbierto = signal(false);
  protected readonly anio = new Date().getFullYear();

  protected readonly primerNombre = computed(() => {
    const nombre = this.auth.sesion()?.nombre ?? '';
    return nombre.trim().split(' ')[0];
  });

  /** Botón principal cuando hay sesión: a su espacio (voluntario o practicante) o su panel (administrador o Recursos Humanos). */
  protected readonly etiquetaMiZona = computed(() => {
    if (this.auth.esAdmin()) return 'Panel';
    if (this.auth.esRRHH()) return 'Recursos Humanos';
    return 'Mi espacio';
  });

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  /** Desde el sitio público, al salir se vuelve a la portada y no al login. */
  protected salir(): void {
    this.cerrarMenu();
    this.auth.logout('/');
  }
}
