import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloUsuarioRoutingModule } from './modulo-usuario-routing-module';
import { Registro } from './registro/registro';
import { MiEspacio } from './mi-espacio/mi-espacio';
import { MisCitas } from './mis-citas/mis-citas';
import { ReservarCita } from './reservar-cita/reservar-cita';

@NgModule({
  declarations: [Registro, MiEspacio, MisCitas, ReservarCita],
  imports: [CommonModule, ReactiveFormsModule, ModuloUsuarioRoutingModule],
})
export class ModuloUsuarioModule {}
