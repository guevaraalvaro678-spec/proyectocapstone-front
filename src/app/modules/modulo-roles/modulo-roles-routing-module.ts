import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { adminGuard, soloAdminGuard } from '../../core/guards/admin.guard';
import { invitadoGuard } from '../../core/guards/invitado.guard';
import { superAdminGuard } from '../../core/guards/super-admin.guard';
import { Admin } from './admin/admin';
import { Correos } from './admin/correos/correos';
import { CrearUsuario } from './admin/crear-usuario/crear-usuario';
import { Dashboard } from './admin/dashboard/dashboard';
import { Eventos } from './admin/eventos/eventos';
import { SitioWeb } from './admin/sitio-web/sitio-web';
import { Asistencia } from './admin/asistencia/asistencia';
import { Practicantes } from './admin/practicantes/practicantes';
import { Tareas } from './admin/tareas/tareas';
import { Voluntarios } from './admin/voluntarios/voluntarios';
import { Mensajes } from './admin/mensajes/mensajes';
import { SeccionMock, SeccionMockData } from './admin/seccion-mock/seccion-mock';
import { Usuarios } from './admin/usuarios/usuarios';
import { Login } from './login/login';
import { OlvidePassword } from './olvide-password/olvide-password';
import { Restablecer } from './restablecer/restablecer';

// Reportes y Configuración todavía son pantallas de ejemplo.
const reportes: SeccionMockData = {
  titulo: 'Reportes',
  descripcion: 'Reportes generados del sistema.',
  columnas: ['Reporte', 'Periodo', 'Generado', 'Estado'],
  filas: [
    ['Atenciones por psicólogo', 'Mayo 2025', '20/05/2025', 'Listo'],
    ['Pacientes nuevos', 'Abril 2025', '02/05/2025', 'Listo'],
    ['Cancelaciones', 'Mayo 2025', '—', 'Pendiente'],
  ],
};

const configuracion: SeccionMockData = {
  titulo: 'Configuración',
  descripcion: 'Parámetros generales del sistema.',
  columnas: ['Parámetro', 'Valor', 'Modificado', 'Estado'],
  filas: [
    ['Duración de sesión', '50 min', '10/05/2025', 'Activo'],
    ['Recordatorio de cita', '24 horas antes', '10/05/2025', 'Activo'],
    ['Horario de atención', '08:00 - 20:00', '01/04/2025', 'Activo'],
  ],
};

const routes: Routes = [
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'olvide-password', component: OlvidePassword },
  { path: 'restablecer', component: Restablecer },
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Dashboard, canActivate: [soloAdminGuard] },
      { path: 'usuarios', component: Usuarios, canActivate: [soloAdminGuard] },
      { path: 'practicantes', component: Practicantes },
      { path: 'voluntarios', component: Voluntarios },
      { path: 'tareas', component: Tareas },
      { path: 'asistencia', component: Asistencia },
      { path: 'mensajes', component: Mensajes, canActivate: [soloAdminGuard] },
      { path: 'correos', component: Correos, canActivate: [soloAdminGuard] },
      { path: 'eventos', component: Eventos, canActivate: [soloAdminGuard] },
      { path: 'sitio', component: SitioWeb, canActivate: [soloAdminGuard] },
      { path: 'administradores', component: CrearUsuario, canActivate: [superAdminGuard] },
      { path: 'reportes', component: SeccionMock, data: reportes, canActivate: [soloAdminGuard] },
      { path: 'configuracion', component: SeccionMock, data: configuracion, canActivate: [soloAdminGuard] },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloRolesRoutingModule {}
