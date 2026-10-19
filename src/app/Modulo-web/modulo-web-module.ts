import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloCompartidoModule } from '../Modulo-compartido/modulo-compartido-module';
import { Contacto } from './Components/web-contacto/web-contacto';
import { Donar } from './Components/web-donar/web-donar';
import { Inicio } from './Components/web-inicio/web-inicio';
import { Iniciativas } from './Components/web-iniciativas/web-iniciativas';
import { ModuloWebRoutingModule } from './modulo-web-routing-module';
import { Nosotros } from './Components/web-nosotros/web-nosotros';
import { WebLayout } from './Components/web-layout/web-layout';

@NgModule({
  declarations: [WebLayout, Inicio, Nosotros, Contacto, Iniciativas, Donar],
  imports: [CommonModule, ReactiveFormsModule, ModuloCompartidoModule, ModuloWebRoutingModule],
})
export class ModuloWebModule {}
