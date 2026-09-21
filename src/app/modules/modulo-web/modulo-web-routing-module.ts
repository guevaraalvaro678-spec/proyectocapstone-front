import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { invitadoGuard } from '../../core/guards/invitado.guard';
import { Contacto } from './contacto/contacto';
import { Inicio } from './inicio/inicio';
import { Iniciativas } from './iniciativas/iniciativas';
import { Nosotros } from './nosotros/nosotros';
import { Servicios } from './servicios/servicios';
import { Unete } from './unete/unete';
import { WebLayout } from './web-layout/web-layout';

/** Sitio público e informativo: no requiere sesión. El botón "Ingresar" lleva a /login. */
const routes: Routes = [
  {
    path: '',
    component: WebLayout,
    children: [
      { path: '', pathMatch: 'full', component: Inicio },
      { path: 'nosotros', component: Nosotros },
      { path: 'iniciativas', component: Iniciativas },
      { path: 'servicios', component: Servicios },
      { path: 'unete', component: Unete, canActivate: [invitadoGuard] },
      // Solo para visitantes: con sesión se pide orientación desde Mi espacio.
      { path: 'contacto', component: Contacto, canActivate: [invitadoGuard] },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloWebRoutingModule {}
