import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Asistencia } from './Components/pra-asistencia/pra-asistencia';
import { Datos } from './Components/pra-datos/pra-datos';
import { Horario } from './Components/pra-horario/pra-horario';
import { ModuloCompartidoModule } from '../Modulo-compartido/modulo-compartido-module';
import { ModuloPracticanteRoutingModule } from './modulo-practicante-routing-module';
import { Tareas } from './Components/pra-tareas/pra-tareas';

@NgModule({
  declarations: [Datos, Horario, Asistencia, Tareas],
  imports: [CommonModule, ReactiveFormsModule, ModuloCompartidoModule, ModuloPracticanteRoutingModule],
})
export class ModuloPracticanteModule {}
