import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Asistencia } from './asistencia/asistencia';
import { Datos } from './datos/datos';
import { Horario } from './horario/horario';
import { ModuloPracticanteRoutingModule } from './modulo-practicante-routing-module';
import { Practicante } from './practicante/practicante';
import { Tareas } from './tareas/tareas';

@NgModule({
  declarations: [Practicante, Datos, Horario, Asistencia, Tareas],
  imports: [CommonModule, ReactiveFormsModule, ModuloPracticanteRoutingModule],
})
export class ModuloPracticanteModule {}
