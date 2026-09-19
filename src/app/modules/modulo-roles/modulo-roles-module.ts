import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloRolesRoutingModule } from './modulo-roles-routing-module';
import { Login } from './login/login';
import { Admin } from './admin/admin';
import { CrearUsuario } from './admin/crear-usuario/crear-usuario';
import { Dashboard } from './admin/dashboard/dashboard';
import { SeccionMock } from './admin/seccion-mock/seccion-mock';

@NgModule({
  declarations: [Login, Admin, CrearUsuario, Dashboard, SeccionMock],
  imports: [CommonModule, ReactiveFormsModule, ModuloRolesRoutingModule],
})
export class ModuloRolesModule {}
