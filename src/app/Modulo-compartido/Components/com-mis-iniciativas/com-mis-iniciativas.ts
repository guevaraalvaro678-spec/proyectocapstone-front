import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { EstadoIniciativa, Iniciativa } from '../../Models/sitio.model';
import { SitioService } from '../../Services/sitio.service';

/**
 * "Mis iniciativas": el voluntario o practicante propone iniciativas comunitarias.
 * Quedan pendientes hasta que el equipo las aprueba; las aprobadas aparecen en el sitio público.
 */
@Component({
  selector: 'app-mis-iniciativas',
  standalone: false,
  templateUrl: './com-mis-iniciativas.html',
  styleUrl: './com-mis-iniciativas.scss',
})
export class MisIniciativas {
  private readonly fb = inject(FormBuilder);
  private readonly sitioService = inject(SitioService);

  protected readonly iniciativas = signal<Iniciativa[]>([]);
  protected readonly cargando = signal(true);
  protected readonly formAbierto = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal('');

  protected readonly etiquetas: Record<EstadoIniciativa, string> = {
    Pendiente: 'Pendiente de revisión',
    Aprobada: 'Aprobada',
    Rechazada: 'Rechazada',
  };

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    texto: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(600)]],
  });

  constructor() {
    this.cargar();
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    this.sitioService.proponerIniciativa(this.form.getRawValue()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.formAbierto.set(false);
        this.form.reset();
        this.aviso.set('Tu iniciativa se envió. El equipo la revisará antes de publicarla.');
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo enviar la iniciativa');
      },
    });
  }

  private cargar(): void {
    this.sitioService.misIniciativas().subscribe({
      next: (lista) => {
        this.iniciativas.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar tus iniciativas');
      },
    });
  }
}
