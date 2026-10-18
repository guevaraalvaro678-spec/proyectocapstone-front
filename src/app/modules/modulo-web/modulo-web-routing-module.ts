import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { invitadoGuard } from '../../core/guards/invitado.guard';
import { participarGuard } from '../../core/guards/participar.guard';
import { Contacto } from './contacto/contacto';
import { Donar } from './donar/donar';
import { Inicio } from './inicio/inicio';
import { Iniciativas } from './iniciativas/iniciativas';
import { Nosotros } from './nosotros/nosotros';
import { WebLayout } from './web-layout/web-layout';

/** Portal público: no requiere sesión. "Participar" decide a dónde ir según la cuenta. */
const routes: Routes = [
  {
    path: '',
    component: WebLayout,
    children: [
      { path: '', pathMatch: 'full', component: Inicio },
      { path: 'nosotros', component: Nosotros },
      { path: 'iniciativas', component: Iniciativas },
      { path: 'donar', component: Donar },
      { path: 'contacto', component: Contacto, canActivate: [invitadoGuard] },
      { path: 'participar', canActivate: [participarGuard], children: [] },
      // Enlaces antiguos.
      { path: 'unete', redirectTo: 'participar' },
      { path: 'servicios', redirectTo: '' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloWebRoutingModule {}
