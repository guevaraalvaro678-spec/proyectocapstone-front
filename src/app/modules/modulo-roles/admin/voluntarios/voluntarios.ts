import { Component, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs';

import { Voluntario } from '../../../../core/models/participante.model';
import { ParticipanteService } from '../../../../core/services/participante.service';

/** Voluntarios registrados: quién es cada uno y cómo contactarlo. */
@Component({
  selector: 'app-voluntarios',
  standalone: false,
  templateUrl: './voluntarios.html',
})
export class Voluntarios {
  private readonly participantes = inject(ParticipanteService);

  protected readonly buscar = new FormControl('', { nonNullable: true });
  protected readonly voluntarios = signal<Voluntario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.buscar.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((texto) => {
          this.cargando.set(true);
          return this.participantes.listarVoluntarios(texto);
        }),
      )
      .subscribe({
        next: (lista) => {
          this.voluntarios.set(lista);
          this.cargando.set(false);
          this.error.set('');
        },
        error: () => {
          this.cargando.set(false);
          this.error.set('No se pudieron cargar los voluntarios');
        },
      });
  }
}
