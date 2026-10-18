import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloCompartidoModule } from '../modulo-compartido/modulo-compartido-module';
import { Contacto } from './contacto/contacto';
import { Donar } from './donar/donar';
import { Inicio } from './inicio/inicio';
import { Iniciativas } from './iniciativas/iniciativas';
import { ModuloWebRoutingModule } from './modulo-web-routing-module';
import { Nosotros } from './nosotros/nosotros';
import { WebLayout } from './web-layout/web-layout';

@NgModule({
  declarations: [WebLayout, Inicio, Nosotros, Contacto, Iniciativas, Donar],
  imports: [CommonModule, ReactiveFormsModule, ModuloCompartidoModule, ModuloWebRoutingModule],
})
export class ModuloWebModule {}
