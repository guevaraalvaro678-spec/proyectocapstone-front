import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { voluntarioGuard } from '../../core/guards/voluntario.guard';
import { Voluntario } from './voluntario/voluntario';

/** Espacio del voluntario: sus datos y sus futuras tareas. */
const routes: Routes = [{ path: 'voluntario', component: Voluntario, canActivate: [voluntarioGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloVoluntarioRoutingModule {}
