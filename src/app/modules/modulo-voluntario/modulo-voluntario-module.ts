import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ModuloCompartidoModule } from '../modulo-compartido/modulo-compartido-module';
import { ModuloVoluntarioRoutingModule } from './modulo-voluntario-routing-module';
import { Voluntario } from './voluntario/voluntario';

@NgModule({
  declarations: [Voluntario],
  imports: [CommonModule, ModuloCompartidoModule, ModuloVoluntarioRoutingModule],
})
export class ModuloVoluntarioModule {}
