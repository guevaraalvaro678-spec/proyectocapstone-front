import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ModuloVoluntarioRoutingModule } from './modulo-voluntario-routing-module';
import { Voluntario } from './voluntario/voluntario';

@NgModule({
  declarations: [Voluntario],
  imports: [CommonModule, ModuloVoluntarioRoutingModule],
})
export class ModuloVoluntarioModule {}
