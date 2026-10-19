import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { voluntarioGuard } from '../guards/voluntario.guard';
import { MiCuenta } from '../Modulo-compartido/Components/com-mi-cuenta/com-mi-cuenta';
import { MisIniciativas } from '../Modulo-compartido/Components/com-mis-iniciativas/com-mis-iniciativas';
import { PortalMiembro } from '../Modulo-compartido/Components/com-portal-miembro/com-portal-miembro';
import { Voluntario } from './Components/vol-voluntario/vol-voluntario';

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
