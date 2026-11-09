import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { Anuncio, AnuncioGuardar, TipoAnuncio } from '../../../Modulo-compartido/Models/anuncio.model';
import { AnuncioService } from '../../../Modulo-compartido/Services/anuncio.service';

/** Anuncios de la franja superior del sitio público: se publican y vencen solos según su vigencia. */
@Component({
  selector: 'app-anuncios',
  standalone: false,
  templateUrl: './rol-anuncios.html',
  styleUrl: './rol-anuncios.scss',
})
export class Anuncios {
  private readonly anuncioService = inject(AnuncioService);
  private readonly fb = inject(FormBuilder);

  protected readonly anuncios = signal<Anuncio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly trabajando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');
  protected readonly editando = signal<Anuncio | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    texto: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
    enlace: ['', Validators.maxLength(300)],
    tipo: ['Informativo' as TipoAnuncio, Validators.required],
    desde: [''],
    hasta: [''],
    activo: [true],
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.anuncioService.listar().subscribe({
      next: (lista) => {
        this.anuncios.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los anuncios');
        this.cargando.set(false);
      },
    });
  }

  protected editar(a: Anuncio): void {
    this.editando.set(a);
    this.form.setValue({
      texto: a.texto,
      enlace: a.enlace ?? '',
      tipo: a.tipo,
      desde: aLocal(a.desde),
      hasta: a.hasta ? aLocal(a.hasta) : '',
      activo: a.activo,
    });
  }

  protected cancelar(): void {
    this.editando.set(null);
    this.form.reset();
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: AnuncioGuardar = {
      texto: v.texto,
      enlace: v.enlace || null,
      tipo: v.tipo,
      // datetime-local está en la hora del navegador; se envía en UTC.
      desde: v.desde ? new Date(v.desde).toISOString() : null,
      hasta: v.hasta ? new Date(v.hasta).toISOString() : null,
      activo: v.activo,
    };
    const actual = this.editando();
    this.ejecutar(actual ? this.anuncioService.actualizar(actual.id, datos) : this.anuncioService.crear(datos), 'Anuncio guardado.', true);
  }

  protected alternar(a: Anuncio): void {
    const datos: AnuncioGuardar = { texto: a.texto, enlace: a.enlace, tipo: a.tipo, desde: a.desde, hasta: a.hasta, activo: !a.activo };
    this.ejecutar(this.anuncioService.actualizar(a.id, datos), a.activo ? 'Anuncio desactivado.' : 'Anuncio activado.');
  }

  protected eliminar(a: Anuncio): void {
    if (!confirm('¿Eliminar este anuncio?')) return;
    this.ejecutar(this.anuncioService.eliminar(a.id), 'Anuncio eliminado.');
  }

  private ejecutar(peticion: Observable<unknown>, mensaje: string, limpiar = false): void {
    this.trabajando.set(true);
    this.error.set('');
    peticion.subscribe({
      next: () => {
        this.trabajando.set(false);
        this.aviso.set(mensaje);
        if (limpiar) this.cancelar();
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.trabajando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo guardar el anuncio');
      },
    });
  }
}

/** ISO (UTC) → valor de un input datetime-local en la hora del navegador. */
function aLocal(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
