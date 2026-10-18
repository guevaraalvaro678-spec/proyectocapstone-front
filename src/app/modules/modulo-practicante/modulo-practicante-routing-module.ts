import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { practicanteGuard } from '../../core/guards/practicante.guard';
import { MiCuenta } from '../modulo-compartido/mi-cuenta/mi-cuenta';
import { MisIniciativas } from '../modulo-compartido/mis-iniciativas/mis-iniciativas';
import { PortalMiembro } from '../modulo-compartido/portal-miembro/portal-miembro';
import { Asistencia } from './asistencia/asistencia';
import { Datos } from './datos/datos';
import { Horario } from './horario/horario';
import { Tareas } from './tareas/tareas';

/** Portal del practicante: perfil, horario, actividades, asistencia, iniciativas y cuenta. */
const routes: Routes = [
  {
    path: 'practicante',
    component: PortalMiembro,
    canActivate: [practicanteGuard],
    data: { tipo: 'Practicante' },
    children: [
      { path: '', pathMatch: 'full', component: Datos },
      { path: 'horario', component: Horario },
      { path: 'asistencia', component: Asistencia },
      { path: 'tareas', component: Tareas },
      { path: 'mis-iniciativas', component: MisIniciativas },
      { path: 'mi-cuenta', component: MiCuenta },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloPracticanteRoutingModule {}
