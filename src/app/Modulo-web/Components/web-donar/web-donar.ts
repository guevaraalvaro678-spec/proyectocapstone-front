import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CATEGORIAS_DONACION, CategoriaDonacion, Donacion, DonacionArticulo } from '../../../Modulo-compartido/Models/donacion.model';
import { DonacionService } from '../../../Modulo-compartido/Services/donacion.service';
import { SitioService } from '../../../Modulo-compartido/Services/sitio.service';

/**
 * "Registra tu donación": artículos físicos que la persona entregará en la sede.
 * Si la ONG configuró Yape, también muestra el número y el QR para donar dinero (la plataforma no procesa pagos).
 */
@Component({
  selector: 'app-donar',
  standalone: false,
  templateUrl: './web-donar.html',
  styleUrl: './web-donar.scss',
})
export class Donar {
  private readonly fb = inject(FormBuilder);
  private readonly donacionService = inject(DonacionService);

  protected readonly categorias = CATEGORIAS_DONACION;
  protected readonly categoria = signal<CategoriaDonacion>('MaterialEducativo');
  protected readonly articulos = signal<DonacionArticulo[]>([]);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly registrada = signal<Donacion | null>(null);

  /** Datos de Yape que configura el administrador (null: la sección no se muestra). */
  protected readonly yape = computed(() => this.sitioService.sitio().yape);
  protected readonly copiado = signal(false);
  private readonly sitioService = inject(SitioService);

  protected copiarNumero(numero: string): void {
    navigator.clipboard
      ?.writeText(numero)
      .then(() => {
        this.copiado.set(true);
        setTimeout(() => this.copiado.set(false), 2000);
      })
      .catch(() => this.copiado.set(false));
  }

  protected readonly totalArticulos = computed(() => this.articulos().reduce((s, a) => s + a.cantidad, 0));

  protected readonly formArticulo = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    cantidad: [1, [Validators.required, Validators.min(1), Validators.max(10000)]],
  });

  protected readonly formDatos = this.fb.nonNullable.group({
    donanteNombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
  });

  protected etiqueta(valor: CategoriaDonacion): string {
    return this.categorias.find((c) => c.valor === valor)?.etiqueta ?? valor;
  }

  protected agregar(): void {
    if (this.formArticulo.invalid) {
      this.formArticulo.markAllAsTouched();
      return;
    }

    const { nombre, cantidad } = this.formArticulo.getRawValue();
    this.articulos.update((lista) => [...lista, { categoria: this.categoria(), nombre: nombre.trim(), cantidad: Number(cantidad) }]);
    this.formArticulo.reset({ nombre: '', cantidad: 1 });
  }

  protected quitar(indice: number): void {
    this.articulos.update((lista) => lista.filter((_, i) => i !== indice));
  }

  protected registrar(): void {
    if (this.articulos().length === 0) {
      this.error.set('Agrega al menos un artículo.');
      return;
    }
    if (this.formDatos.invalid) {
      this.formDatos.markAllAsTouched();
      this.error.set('Completa tu nombre y teléfono.');
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    this.donacionService.registrar({ ...this.formDatos.getRawValue(), articulos: this.articulos() }).subscribe({
      next: (d) => {
        this.enviando.set(false);
        this.registrada.set(d);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo registrar la donación. Inténtalo de nuevo.');
      },
    });
  }

  protected otra(): void {
    this.registrada.set(null);
    this.articulos.set([]);
    this.formDatos.reset();
  }
}
