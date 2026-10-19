import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';

import {
  CATEGORIAS_DONACION,
  CategoriaDonacion,
  Donacion,
  DonacionResumen,
  ETIQUETA_DONACION,
  EstadoDonacion,
} from '../../../Modulo-compartido/Models/donacion.model';
import { DonacionService } from '../../../Modulo-compartido/Services/donacion.service';

/** Donaciones de artículos registradas desde el sitio público: el equipo confirma si se recibieron. */
@Component({
  selector: 'app-donaciones',
  standalone: false,
  templateUrl: './rol-donaciones.html',
  styleUrl: './rol-donaciones.scss',
})
export class Donaciones {
  private readonly donacionService = inject(DonacionService);

  protected readonly etiquetas = ETIQUETA_DONACION;
  protected readonly buscar = new FormControl('', { nonNullable: true });
  protected readonly estado = signal('');
  protected readonly donaciones = signal<Donacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  /** Totales por estado e inventario de lo recibido: los calcula el backend (GET api/donacion/resumen). */
  private readonly totales = signal<DonacionResumen | null>(null);
  protected readonly inventario = computed(() => this.totales()?.inventario ?? []);
  protected readonly indicadores = computed(() => ({
    pendientes: this.totales()?.pendientes ?? 0,
    recibidas: this.totales()?.recibidas ?? 0,
    desestimadas: this.totales()?.desestimadas ?? 0,
    total: this.totales()?.total ?? 0,
  }));

  protected readonly detalle = signal<Donacion | null>(null);
  protected readonly observaciones = signal('');
  protected readonly trabajando = signal(false);

  constructor() {
    this.buscar.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.cargar());
    this.cargar();
  }

  protected cargar(): void {
    this.donacionService.listar(this.estado(), this.buscar.value).subscribe({
      next: (lista) => {
        this.donaciones.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las donaciones');
        this.cargando.set(false);
      },
    });
    this.donacionService.resumen().subscribe((r) => this.totales.set(r));
  }

  protected filtrar(valor: string): void {
    this.estado.set(valor);
    this.cargar();
  }

  protected resumen(d: Donacion): string {
    return d.articulos.map((a) => `${a.cantidad} ${a.nombre}`).join(', ');
  }

  protected categoria(valor: CategoriaDonacion): string {
    return CATEGORIAS_DONACION.find((c) => c.valor === valor)?.etiqueta ?? valor;
  }

  protected abrir(d: Donacion): void {
    this.detalle.set(d);
    this.observaciones.set(d.observaciones ?? '');
  }

  protected cambiar(estado: EstadoDonacion): void {
    const d = this.detalle();
    if (!d) return;
    this.guardar(this.donacionService.cambiarEstado(d.id, estado, this.observaciones()));
  }

  protected guardarObservaciones(): void {
    const d = this.detalle();
    if (!d) return;
    this.guardar(this.donacionService.guardarObservaciones(d.id, this.observaciones()));
  }

  private guardar(peticion: Observable<Donacion>): void {
    this.trabajando.set(true);
    peticion.subscribe({
      next: (actualizada) => {
        this.trabajando.set(false);
        this.detalle.set(actualizada);
        this.aviso.set(`${actualizada.codigo}: ${this.etiquetas[actualizada.estado]}.`);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.trabajando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo actualizar la donación');
      },
    });
  }
}
