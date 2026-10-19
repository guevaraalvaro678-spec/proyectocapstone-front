import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ModuloCompartidoModule } from '../Modulo-compartido/modulo-compartido-module';
import { ModuloVoluntarioRoutingModule } from './modulo-voluntario-routing-module';
import { Voluntario } from './Components/vol-voluntario/vol-voluntario';

@NgModule({
  declarations: [Voluntario],
  imports: [CommonModule, ModuloCompartidoModule, ModuloVoluntarioRoutingModule],
})
export class ModuloVoluntarioModule {}
