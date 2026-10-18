import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { voluntarioGuard } from '../../core/guards/voluntario.guard';
import { MiCuenta } from '../modulo-compartido/mi-cuenta/mi-cuenta';
import { MisIniciativas } from '../modulo-compartido/mis-iniciativas/mis-iniciativas';
import { PortalMiembro } from '../modulo-compartido/portal-miembro/portal-miembro';
import { Voluntario } from './voluntario/voluntario';

/** Portal del voluntario: sus datos y actividades, sus iniciativas y su cuenta (sin horario). */
const routes: Routes = [
  {
    path: 'voluntario',
    component: PortalMiembro,
    canActivate: [voluntarioGuard],
    data: { tipo: 'Voluntario' },
    children: [
      { path: '', pathMatch: 'full', component: Voluntario },
      { path: 'mis-iniciativas', component: MisIniciativas },
      { path: 'mi-cuenta', component: MiCuenta },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloVoluntarioRoutingModule {}
