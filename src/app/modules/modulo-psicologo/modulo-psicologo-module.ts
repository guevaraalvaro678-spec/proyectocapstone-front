import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloPsicologoRoutingModule } from './modulo-psicologo-routing-module';
import { Panel } from './panel/panel';
import { Resumen } from './resumen/resumen';
import { Citas } from './citas/citas';
import { Horarios } from './horarios/horarios';
import { Solicitudes } from './solicitudes/solicitudes';

@NgModule({
  declarations: [Panel, Resumen, Citas, Horarios, Solicitudes],
  imports: [CommonModule, ReactiveFormsModule, ModuloPsicologoRoutingModule],
})
export class ModuloPsicologoModule {}
