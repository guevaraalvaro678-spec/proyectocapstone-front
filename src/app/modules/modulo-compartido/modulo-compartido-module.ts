import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CabeceraPublica } from './cabecera-publica/cabecera-publica';
import { Marca } from './marca/marca';
import { MiCuenta } from './mi-cuenta/mi-cuenta';
import { MisIniciativas } from './mis-iniciativas/mis-iniciativas';
import { PiePublico } from './pie-publico/pie-publico';
import { PortalMiembro } from './portal-miembro/portal-miembro';

/**
 * Piezas que usan varios módulos: la cabecera y el pie del sitio público, la marca de AMAAC,
 * "Mi cuenta y seguridad" y "Mis iniciativas".
 */
@NgModule({
  declarations: [Marca, CabeceraPublica, PiePublico, MiCuenta, MisIniciativas, PortalMiembro],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  exports: [Marca, CabeceraPublica, PiePublico, MiCuenta, MisIniciativas, PortalMiembro],
})
export class ModuloCompartidoModule {}
