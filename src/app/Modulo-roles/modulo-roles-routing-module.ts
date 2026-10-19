import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { adminGuard, soloAdminGuard } from '../guards/admin.guard';
import { invitadoGuard } from '../guards/invitado.guard';
import { superAdminGuard } from '../guards/super-admin.guard';
import { MiCuenta } from '../Modulo-compartido/Components/com-mi-cuenta/com-mi-cuenta';
import { Admin } from './Components/rol-admin/rol-admin';
import { Asistencia } from './Components/rol-asistencia/rol-asistencia';
import { Configuracion } from './Components/rol-configuracion/rol-configuracion';
import { Correos } from './Components/rol-correos/rol-correos';
import { CrearUsuario } from './Components/rol-crear-usuario/rol-crear-usuario';
import { Dashboard } from './Components/rol-dashboard/rol-dashboard';
import { Donaciones } from './Components/rol-donaciones/rol-donaciones';
import { Entrevistas } from './Components/rol-entrevistas/rol-entrevistas';
import { Eventos } from './Components/rol-eventos/rol-eventos';
import { GestionIniciativas } from './Components/rol-gestion-iniciativas/rol-gestion-iniciativas';
import { Mensajes } from './Components/rol-mensajes/rol-mensajes';
import { Miembros } from './Components/rol-miembros/rol-miembros';
import { Noticias } from './Components/rol-noticias/rol-noticias';
import { Postulaciones } from './Components/rol-postulaciones/rol-postulaciones';
import { Practicantes } from './Components/rol-practicantes/rol-practicantes';
import { Tareas } from './Components/rol-tareas/rol-tareas';
import { Usuarios } from './Components/rol-usuarios/rol-usuarios';
import { Login } from './Components/rol-login/rol-login';
import { OlvidePassword } from './Components/rol-olvide-password/rol-olvide-password';
import { Registro } from './Components/rol-registro/rol-registro';
import { Restablecer } from './Components/rol-restablecer/rol-restablecer';

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
