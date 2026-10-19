import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { practicanteGuard } from '../guards/practicante.guard';
import { MiCuenta } from '../Modulo-compartido/Components/com-mi-cuenta/com-mi-cuenta';
import { MisIniciativas } from '../Modulo-compartido/Components/com-mis-iniciativas/com-mis-iniciativas';
import { PortalMiembro } from '../Modulo-compartido/Components/com-portal-miembro/com-portal-miembro';
import { Asistencia } from './Components/pra-asistencia/pra-asistencia';
import { Datos } from './Components/pra-datos/pra-datos';
import { Horario } from './Components/pra-horario/pra-horario';
import { Tareas } from './Components/pra-tareas/pra-tareas';

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
