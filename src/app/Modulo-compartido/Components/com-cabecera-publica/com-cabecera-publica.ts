import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../Services/auth.service';

interface EnlacePublico {
  etiqueta: string;
  ruta: string;
  /** Sección del inicio a la que baja (Campañas, Noticias, Eventos). */
  seccion?: string;
}

/** Cabecera del sitio público: marca, menú y los botones Donar, Participar e Ingresar. */
@Component({
  selector: 'app-cabecera-publica',
  standalone: false,
  templateUrl: './com-cabecera-publica.html',
  styleUrl: './com-cabecera-publica.scss',
})
export class CabeceraPublica {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly menuAbierto = signal(false);

  protected readonly enlaces: EnlacePublico[] = [
    { etiqueta: 'Inicio', ruta: '/' },
    { etiqueta: 'Nosotros', ruta: '/nosotros' },
    { etiqueta: 'Campañas', ruta: '/', seccion: 'campanas' },
    { etiqueta: 'Iniciativas', ruta: '/iniciativas' },
    { etiqueta: 'Noticias', ruta: '/', seccion: 'noticias' },
    { etiqueta: 'Eventos', ruta: '/', seccion: 'eventos' },
  ];

  /** Texto del botón de la cuenta según el rol. */
  protected readonly etiquetaMiZona = computed(() => {
    if (this.auth.esAdmin()) return 'Panel';
    if (this.auth.esRRHH()) return 'Recursos Humanos';
    if (this.auth.esPostulante()) return 'Mi postulación';
    return 'Mi espacio';
  });

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected salir(): void {
    this.cerrarMenu();
    this.auth.logout('/');
  }

  protected esActivo(enlace: EnlacePublico): boolean {
    if (enlace.seccion) return false;
    const url = this.router.url.split('#')[0].split('?')[0];
    return enlace.ruta === '/' ? url === '/' : url.startsWith(enlace.ruta);
  }
}
