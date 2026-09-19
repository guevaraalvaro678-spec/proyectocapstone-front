import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export interface SeccionMockData {
  titulo: string;
  descripcion: string;
  columnas: string[];
  filas: string[][];
}

/** Pantalla de ejemplo (mockup): muestra una tabla con datos de muestra según la ruta. */
@Component({
  selector: 'app-seccion-mock',
  standalone: false,
  templateUrl: './seccion-mock.html',
  styleUrl: './seccion-mock.scss',
})
export class SeccionMock {
  protected readonly info = inject(ActivatedRoute).snapshot.data as SeccionMockData;
}
