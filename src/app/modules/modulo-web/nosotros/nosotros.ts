import { Component } from '@angular/core';

import { ONG } from '../../../core/config/ong.config';

@Component({
  selector: 'app-nosotros',
  standalone: false,
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss',
})
export class Nosotros {
  protected readonly ong = ONG;

  protected readonly valores = [
    { icono: '🤝', titulo: 'Voluntariado', texto: 'Jóvenes que dedican su tiempo a mejorar su comunidad.' },
    { icono: '📚', titulo: 'Educación', texto: 'Talleres y actividades que forman y transforman.' },
    { icono: '🌱', titulo: 'Cuidado del entorno', texto: 'Respeto por el ambiente y por los animales.' },
    { icono: '💚', titulo: 'Valores y principios', texto: 'Buenas costumbres y salud mental como base.' },
  ];
}
