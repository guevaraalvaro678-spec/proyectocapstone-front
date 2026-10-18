import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Asistencia } from './asistencia/asistencia';
import { Datos } from './datos/datos';
import { Horario } from './horario/horario';
import { ModuloCompartidoModule } from '../modulo-compartido/modulo-compartido-module';
import { ModuloPracticanteRoutingModule } from './modulo-practicante-routing-module';
import { Tareas } from './tareas/tareas';

@NgModule({
  declarations: [Datos, Horario, Asistencia, Tareas],
  imports: [CommonModule, ReactiveFormsModule, ModuloCompartidoModule, ModuloPracticanteRoutingModule],
})
export class ModuloPracticanteModule {}
