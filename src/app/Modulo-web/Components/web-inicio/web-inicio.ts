import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { urlServidor } from '../../../config/api.config';
import { ONG } from '../../../config/ong.config';
import { Noticia } from '../../../Modulo-compartido/Models/donacion.model';
import { Evento } from '../../../Modulo-compartido/Models/evento.model';
import { AuthService } from '../../../Modulo-compartido/Services/auth.service';
import { DonacionService } from '../../../Modulo-compartido/Services/donacion.service';
import { EventoService } from '../../../Modulo-compartido/Services/evento.service';
import { SitioService } from '../../../Modulo-compartido/Services/sitio.service';

const SEGUNDOS_POR_DIAPOSITIVA = 7;

/**
 * Inicio del portal público (diseño de Stitch): portada con foto, Sobre AMAAC, campañas, iniciativas,
 * noticias, próximos eventos, donaciones y "Únete". La portada es un carrusel: la bienvenida y luego
 * las campañas o eventos que tengan imagen.
 */
@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './web-inicio.html',
  styleUrl: './web-inicio.scss',
})
export class Inicio {
  protected readonly auth = inject(AuthService);
  private readonly eventoService = inject(EventoService);
  private readonly donacionService = inject(DonacionService);
  private readonly sitioService = inject(SitioService);

  protected readonly ong = ONG;
  protected readonly eventos = signal<Evento[]>([]);
  protected readonly noticias = signal<Noticia[]>([]);
  protected readonly noticiaAbierta = signal<number | null>(null);

  protected readonly campanas = computed(() => this.eventos().filter((e) => e.tipo === 'Campana').slice(0, 3));
  protected readonly proximosEventos = computed(() => this.eventos().filter((e) => e.tipo !== 'Campana').slice(0, 4));
  protected readonly iniciativas = computed(() => this.sitioService.sitio().iniciativas.slice(0, 3));

  // ---- Carrusel de la portada ----

  /** Diapositivas después de la bienvenida: campañas y eventos con imagen. */
  protected readonly destacados = computed(() => this.eventos().filter((e) => !!e.imagenUrl).slice(0, 4));
  protected readonly indice = signal(0);
  protected readonly totalSlides = computed(() => 1 + this.destacados().length);
  protected readonly puntos = computed(() => Array.from({ length: this.totalSlides() }, (_, i) => i));

  private temporizador: ReturnType<typeof setInterval> | undefined;
  private inicioArrastreX: number | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.pausar());

    this.eventoService.listarPublicos().subscribe({
      next: (eventos) => {
        this.eventos.set(eventos.map((e) => ({ ...e, imagenUrl: urlServidor(e.imagenUrl) })));
        this.reanudar();
      },
      error: () => this.eventos.set([]),
    });

    this.donacionService.noticiasPublicas().subscribe({
      next: (lista) => this.noticias.set(lista.slice(0, 3)),
      error: () => this.noticias.set([]),
    });
  }

  protected ir(posicion: number): void {
    const total = this.totalSlides();
    this.indice.set(((posicion % total) + total) % total);
    this.reanudar();
  }

  protected pausar(): void {
    clearInterval(this.temporizador);
    this.temporizador = undefined;
  }

  protected reanudar(): void {
    this.pausar();
    if (this.totalSlides() > 1) {
      this.temporizador = setInterval(
        () => this.indice.update((i) => (i + 1) % this.totalSlides()),
        SEGUNDOS_POR_DIAPOSITIVA * 1000,
      );
    }
  }

  protected empezarArrastre(evento: PointerEvent): void {
    this.inicioArrastreX = evento.clientX;
  }

  protected terminarArrastre(evento: PointerEvent): void {
    if (this.inicioArrastreX === null) return;
    const desplazamiento = evento.clientX - this.inicioArrastreX;
    this.inicioArrastreX = null;
    if (Math.abs(desplazamiento) > 50) this.ir(this.indice() + (desplazamiento < 0 ? 1 : -1));
  }

  protected cancelarArrastre(): void {
    this.inicioArrastreX = null;
  }

  protected alternarNoticia(id: number): void {
    this.noticiaAbierta.update((actual) => (actual === id ? null : id));
  }

  protected ocultarImagen(evento: Event): void {
    (evento.target as HTMLElement).style.display = 'none';
  }
}
