import { Component, computed, inject, signal } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

/** Marco del sitio público: barra superior, contenido de cada página y pie de página. */
@Component({
  selector: 'app-web-layout',
  standalone: false,
  templateUrl: './web-layout.html',
  styleUrl: './web-layout.scss',
})
export class WebLayout {
  protected readonly auth = inject(AuthService);

  private readonly todosLosEnlaces = [
    { ruta: '/', etiqueta: 'Inicio', exacto: true, soloVisitantes: false },
    { ruta: '/nosotros', etiqueta: 'Nosotros', exacto: false, soloVisitantes: false },
    { ruta: '/servicios', etiqueta: 'Servicios', exacto: false, soloVisitantes: false },
    { ruta: '/unete', etiqueta: 'Únete', exacto: false, soloVisitantes: true },
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

  /** Botón principal cuando hay sesión: a su espacio (usuario), su agenda (psicólogo) o su panel (administrador). */
  protected readonly etiquetaMiZona = computed(() => {
    if (this.auth.esAdmin()) return 'Panel';
    if (this.auth.esPsicologo()) return 'Mi agenda';
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
