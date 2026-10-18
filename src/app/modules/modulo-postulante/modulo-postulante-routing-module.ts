import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { postulanteGuard } from '../../core/guards/postulante.guard';
import { MiCuenta } from '../modulo-compartido/mi-cuenta/mi-cuenta';
import { MiPostulacion } from './mi-postulacion/mi-postulacion';
import { PortalPostulante } from './portal-postulante/portal-postulante';
import { Postular } from './postular/postular';

const routes: Routes = [
  {
    path: '',
    component: PortalPostulante,
    canActivate: [postulanteGuard],
    children: [
      { path: 'postular', component: Postular },
      { path: 'mi-postulacion', component: MiPostulacion },
      { path: 'mi-cuenta-postulante', component: MiCuenta },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloPostulanteRoutingModule {}
