import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { postulanteGuard } from '../guards/postulante.guard';
import { MiCuenta } from '../Modulo-compartido/Components/com-mi-cuenta/com-mi-cuenta';
import { MiPostulacion } from './Components/pos-mi-postulacion/pos-mi-postulacion';
import { PortalPostulante } from './Components/pos-portal-postulante/pos-portal-postulante';
import { Postular } from './Components/pos-postular/pos-postular';

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
