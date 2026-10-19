import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CabeceraPublica } from './Components/com-cabecera-publica/com-cabecera-publica';
import { Marca } from './Components/com-marca/com-marca';
import { MiCuenta } from './Components/com-mi-cuenta/com-mi-cuenta';
import { MisIniciativas } from './Components/com-mis-iniciativas/com-mis-iniciativas';
import { PiePublico } from './Components/com-pie-publico/com-pie-publico';
import { PortalMiembro } from './Components/com-portal-miembro/com-portal-miembro';

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
