import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { ONG } from '../../../core/config/ong.config';
import { Evento, ModalidadEvento } from '../../../core/models/evento.model';
import { AuthService } from '../../../core/services/auth.service';
import { EventoService } from '../../../core/services/evento.service';
import { SitioService } from '../../../core/services/sitio.service';

const SEGUNDOS_POR_EVENTO = 7;

const ICONO_MODALIDAD: Record<ModalidadEvento, string> = {
  Presencial: '🤝',
  Virtual: '💻',
  Mixta: '🌐',
};

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  protected readonly auth = inject(AuthService);
  private readonly eventoService = inject(EventoService);

  // ---- Carrusel de la portada ----
  // La diapositiva 0 es la bienvenida (siempre está); las siguientes son los eventos publicados.

  protected readonly eventos = signal<Evento[]>([]);
  protected readonly indice = signal(0);
  protected readonly totalSlides = computed(() => 1 + this.eventos().length);
  protected readonly puntos = computed(() => Array.from({ length: this.totalSlides() }, (_, i) => i));

  private temporizador: ReturnType<typeof setInterval> | undefined;
  private inicioArrastreX: number | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.pausar());

    // Si falla la carga (o no hay eventos) queda solo la bienvenida, sin carrusel.
    this.eventoService.listarPublicos().subscribe({
      next: (eventos) => {
        this.eventos.set(eventos);
        this.reanudar();
      },
      error: () => this.eventos.set([]),
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

  /** Vuelve a arrancar el avance automático (solo si hay más de una diapositiva). */
  protected reanudar(): void {
    this.pausar();

    if (this.totalSlides() > 1) {
      this.temporizador = setInterval(
        () => this.indice.update((i) => (i + 1) % this.totalSlides()),
        SEGUNDOS_POR_EVENTO * 1000,
      );
    }
  }

  // Deslizar con el dedo o arrastrando: un movimiento horizontal de más de 50 px cambia de diapositiva.

  protected empezarArrastre(evento: PointerEvent): void {
    this.inicioArrastreX = evento.clientX;
  }

  protected terminarArrastre(evento: PointerEvent): void {
    if (this.inicioArrastreX === null) return;

    const desplazamiento = evento.clientX - this.inicioArrastreX;
    this.inicioArrastreX = null;

    if (Math.abs(desplazamiento) > 50) {
      this.ir(this.indice() + (desplazamiento < 0 ? 1 : -1));
    }
  }

  protected cancelarArrastre(): void {
    this.inicioArrastreX = null;
  }

  protected fecha(iso: string): string {
    const texto = new Date(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  protected hora(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  protected icono(evento: Evento): string {
    return ICONO_MODALIDAD[evento.modalidad] ?? '📅';
  }

  protected ocultarImagen(evento: Event): void {
    (evento.target as HTMLElement).style.display = 'none';
  }

  protected readonly ong = ONG;
  private readonly sitioService = inject(SitioService);
  protected readonly iniciativas = computed(() => this.sitioService.sitio().iniciativas);
}
