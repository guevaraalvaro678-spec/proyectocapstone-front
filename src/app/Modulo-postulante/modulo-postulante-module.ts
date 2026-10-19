import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloCompartidoModule } from '../Modulo-compartido/modulo-compartido-module';
import { MiPostulacion } from './Components/pos-mi-postulacion/pos-mi-postulacion';
import { ModuloPostulanteRoutingModule } from './modulo-postulante-routing-module';
import { PortalPostulante } from './Components/pos-portal-postulante/pos-portal-postulante';
import { Postular } from './Components/pos-postular/pos-postular';

/** Portal de quien postula: el formulario de postulación y el seguimiento de su proceso. */
@NgModule({
  declarations: [PortalPostulante, Postular, MiPostulacion],
  imports: [CommonModule, ReactiveFormsModule, ModuloCompartidoModule, ModuloPostulanteRoutingModule],
})
export class ModuloPostulanteModule {}
