import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { invitadoGuard } from '../guards/invitado.guard';
import { participarGuard } from '../guards/participar.guard';
import { Contacto } from './Components/web-contacto/web-contacto';
import { Donar } from './Components/web-donar/web-donar';
import { Inicio } from './Components/web-inicio/web-inicio';
import { Iniciativas } from './Components/web-iniciativas/web-iniciativas';
import { Nosotros } from './Components/web-nosotros/web-nosotros';
import { WebLayout } from './Components/web-layout/web-layout';

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
