import { Component } from '@angular/core';

import { ONG } from '../../../core/config/ong.config';

/** Nosotros: misión, propósito y lo que mueve a AMAAC. */
@Component({
  selector: 'app-nosotros',
  standalone: false,
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss',
})
export class Nosotros {
  protected readonly ong = ONG;

  protected readonly valores = [
    { icono: 'volunteer_activism', titulo: 'Voluntariado', texto: 'Jóvenes que dedican su tiempo a mejorar su comunidad.' },
    { icono: 'school', titulo: 'Educación', texto: 'Talleres y actividades que forman y transforman.' },
    { icono: 'forest', titulo: 'Cuidado del entorno', texto: 'Respeto por el ambiente y por los animales.' },
    { icono: 'favorite', titulo: 'Valores y principios', texto: 'Buenas costumbres y salud mental como base.' },
  ];
}
