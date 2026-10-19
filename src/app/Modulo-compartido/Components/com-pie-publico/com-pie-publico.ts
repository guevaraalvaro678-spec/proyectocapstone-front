import { Component } from '@angular/core';

import { ONG } from '../../../config/ong.config';

/** Pie del sitio público, en verde oscuro. */
@Component({
  selector: 'app-pie-publico',
  standalone: false,
  templateUrl: './com-pie-publico.html',
  styleUrl: './com-pie-publico.scss',
})
export class PiePublico {
  protected readonly ong = ONG;
  protected readonly anio = new Date().getFullYear();
}
