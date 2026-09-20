import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { invitadoGuard } from '../../core/guards/invitado.guard';
import { usuarioGuard } from '../../core/guards/usuario.guard';
import { MiEspacio } from './mi-espacio/mi-espacio';
import { Registro } from './registro/registro';

/** Área del usuario común: registro público y "Mi espacio" (requiere sesión de usuario). */
const routes: Routes = [
  { path: 'registro', component: Registro, canActivate: [invitadoGuard] },
  { path: 'mi-espacio', component: MiEspacio, canActivate: [usuarioGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloUsuarioRoutingModule {}
