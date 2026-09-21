import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { practicanteGuard } from '../../core/guards/practicante.guard';
import { Asistencia } from './asistencia/asistencia';
import { Datos } from './datos/datos';
import { Horario } from './horario/horario';
import { Practicante } from './practicante/practicante';
import { Tareas } from './tareas/tareas';

/** Espacio del practicante: sus datos y sus módulos (horario, asistencia y tareas). */
const routes: Routes = [
  {
    path: 'practicante',
    component: Practicante,
    canActivate: [practicanteGuard],
    children: [
      { path: '', pathMatch: 'full', component: Datos },
      { path: 'horario', component: Horario },
      { path: 'asistencia', component: Asistencia },
      { path: 'tareas', component: Tareas },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloPracticanteRoutingModule {}
