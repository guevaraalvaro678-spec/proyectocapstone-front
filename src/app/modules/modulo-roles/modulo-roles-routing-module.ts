import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { adminGuard, soloAdminGuard } from '../../core/guards/admin.guard';
import { invitadoGuard } from '../../core/guards/invitado.guard';
import { superAdminGuard } from '../../core/guards/super-admin.guard';
import { MiCuenta } from '../modulo-compartido/mi-cuenta/mi-cuenta';
import { Admin } from './admin/admin';
import { Asistencia } from './admin/asistencia/asistencia';
import { Configuracion } from './admin/configuracion/configuracion';
import { Correos } from './admin/correos/correos';
import { CrearUsuario } from './admin/crear-usuario/crear-usuario';
import { Dashboard } from './admin/dashboard/dashboard';
import { Donaciones } from './admin/donaciones/donaciones';
import { Entrevistas } from './admin/entrevistas/entrevistas';
import { Eventos } from './admin/eventos/eventos';
import { GestionIniciativas } from './admin/gestion-iniciativas/gestion-iniciativas';
import { Mensajes } from './admin/mensajes/mensajes';
import { Miembros } from './admin/miembros/miembros';
import { Noticias } from './admin/noticias/noticias';
import { Postulaciones } from './admin/postulaciones/postulaciones';
import { Practicantes } from './admin/practicantes/practicantes';
import { Tareas } from './admin/tareas/tareas';
import { Usuarios } from './admin/usuarios/usuarios';
import { Login } from './login/login';
import { OlvidePassword } from './olvide-password/olvide-password';
import { Registro } from './registro/registro';
import { Restablecer } from './restablecer/restablecer';

const routes: Routes = [
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'registro', component: Registro, canActivate: [invitadoGuard] },
  { path: 'olvide-password', component: OlvidePassword },
  { path: 'restablecer', component: Restablecer },
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Dashboard, canActivate: [soloAdminGuard] },

      // Selección y miembros (también Recursos Humanos).
      { path: 'postulaciones', component: Postulaciones },
      { path: 'entrevistas', component: Entrevistas },
      { path: 'miembros', component: Miembros },
      { path: 'horarios', component: Practicantes },
      { path: 'tareas', component: Tareas },
      { path: 'asistencia', component: Asistencia },

      // Gestión institucional.
      { path: 'campanas', component: Eventos, canActivate: [soloAdminGuard] },
      { path: 'iniciativas', component: GestionIniciativas, canActivate: [soloAdminGuard] },
      { path: 'noticias', component: Noticias, canActivate: [soloAdminGuard] },
      { path: 'donaciones', component: Donaciones, canActivate: [soloAdminGuard] },

      // Administración.
      { path: 'usuarios', component: Usuarios, canActivate: [soloAdminGuard] },
      { path: 'administradores', component: CrearUsuario, canActivate: [superAdminGuard] },
      { path: 'mensajes', component: Mensajes, canActivate: [soloAdminGuard] },
      { path: 'correos', component: Correos, canActivate: [soloAdminGuard] },
      { path: 'configuracion', component: Configuracion, canActivate: [soloAdminGuard] },
      { path: 'mi-cuenta', component: MiCuenta, data: { conPortada: false } },

      // Rutas antiguas.
      { path: 'practicantes', redirectTo: 'horarios' },
      { path: 'voluntarios', redirectTo: 'miembros' },
      { path: 'eventos', redirectTo: 'campanas' },
      { path: 'sitio', redirectTo: 'iniciativas' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloRolesRoutingModule {}
