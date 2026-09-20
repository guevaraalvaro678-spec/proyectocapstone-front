import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { psicologoGuard } from '../../core/guards/psicologo.guard';
import { Citas } from './citas/citas';
import { Horarios } from './horarios/horarios';
import { Panel } from './panel/panel';
import { Resumen } from './resumen/resumen';
import { Solicitudes } from './solicitudes/solicitudes';

/** Panel del psicólogo: su agenda, los horarios que ofrece a los pacientes y las solicitudes que le asignaron. */
const routes: Routes = [
  {
    path: 'psicologo',
    component: Panel,
    canActivate: [psicologoGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      { path: 'resumen', component: Resumen },
      { path: 'citas', component: Citas },
      { path: 'horarios', component: Horarios },
      { path: 'solicitudes', component: Solicitudes },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloPsicologoRoutingModule {}
