import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import {
  CATEGORIAS_DONACION,
  CategoriaDonacion,
  Donacion,
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

  /** Donaciones recibidas: con ellas se arma el inventario, sin importar el filtro de la tabla. */
  private readonly recibidas = signal<Donacion[]>([]);

  /** Inventario: lo recibido sumado por artículo y categoría. Se actualiza solo al marcar una donación como recibida. */
  protected readonly inventario = computed(() => {
    const total = new Map<string, { categoria: CategoriaDonacion; nombre: string; cantidad: number }>();
    for (const a of this.recibidas().flatMap((d) => d.articulos)) {
      const clave = `${a.categoria}|${a.nombre.trim().toLowerCase()}`;
      const item = total.get(clave) ?? { categoria: a.categoria, nombre: a.nombre.trim(), cantidad: 0 };
      item.cantidad += a.cantidad;
      total.set(clave, item);
    }
    return [...total.values()].sort((x, y) => x.categoria.localeCompare(y.categoria) || x.nombre.localeCompare(y.nombre));
  });

  protected readonly detalle = signal<Donacion | null>(null);
  protected readonly observaciones = signal('');
  protected readonly trabajando = signal(false);

  protected readonly indicadores = computed(() => {
    const lista = this.donaciones();
    const contar = (e: EstadoDonacion) => lista.filter((d) => d.estado === e).length;
    return {
      pendientes: contar('PendienteRecepcion'),
      recibidas: contar('Recibida'),
      desestimadas: contar('Desestimada'),
      total: lista.length,
    };
  });

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
    this.donacionService.listar('Recibida', '').subscribe((lista) => this.recibidas.set(lista));
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

    this.trabajando.set(true);
    this.donacionService.cambiarEstado(d.id, estado, this.observaciones()).subscribe({
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
