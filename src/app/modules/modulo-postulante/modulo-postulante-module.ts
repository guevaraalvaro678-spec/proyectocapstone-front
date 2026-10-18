import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloCompartidoModule } from '../modulo-compartido/modulo-compartido-module';
import { MiPostulacion } from './mi-postulacion/mi-postulacion';
import { ModuloPostulanteRoutingModule } from './modulo-postulante-routing-module';
import { PortalPostulante } from './portal-postulante/portal-postulante';
import { Postular } from './postular/postular';

/** Portal de quien postula: el formulario de postulación y el seguimiento de su proceso. */
@NgModule({
  declarations: [PortalPostulante, Postular, MiPostulacion],
  imports: [CommonModule, ReactiveFormsModule, ModuloCompartidoModule, ModuloPostulanteRoutingModule],
})
export class ModuloPostulanteModule {}
