import { Component, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

/** Layout del practicante: información a un lado y sus módulos (horario, asistencia, tareas). Color naranja. */
@Component({
  selector: 'app-practicante',
  standalone: false,
  templateUrl: './practicante.html',
  styleUrl: './practicante.scss',
})
export class Practicante {
  protected readonly auth = inject(AuthService);

  protected readonly menu = [
    { ruta: '/practicante', etiqueta: 'Mis datos', icono: '👤', exacto: true },
    { ruta: '/practicante/horario', etiqueta: 'Mi horario', icono: '📅', exacto: false },
    { ruta: '/practicante/asistencia', etiqueta: 'Asistencia', icono: '🕒', exacto: false },
    { ruta: '/practicante/tareas', etiqueta: 'Tareas', icono: '✅', exacto: false },
  ];
}
