import { Component } from '@angular/core';

import { ONG } from '../../../core/config/ong.config';

/** Pie del sitio público, en verde oscuro. */
@Component({
  selector: 'app-pie-publico',
  standalone: false,
  templateUrl: './pie-publico.html',
  styleUrl: './pie-publico.scss',
})
export class PiePublico {
  protected readonly ong = ONG;
  protected readonly anio = new Date().getFullYear();
}
