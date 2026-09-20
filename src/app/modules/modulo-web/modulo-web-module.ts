import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloWebRoutingModule } from './modulo-web-routing-module';
import { WebLayout } from './web-layout/web-layout';
import { Inicio } from './inicio/inicio';
import { Nosotros } from './nosotros/nosotros';
import { Servicios } from './servicios/servicios';
import { Contacto } from './contacto/contacto';
import { Unete } from './unete/unete';

@NgModule({
  declarations: [WebLayout, Inicio, Nosotros, Servicios, Contacto, Unete],
  imports: [CommonModule, ReactiveFormsModule, ModuloWebRoutingModule],
})
export class ModuloWebModule {}
