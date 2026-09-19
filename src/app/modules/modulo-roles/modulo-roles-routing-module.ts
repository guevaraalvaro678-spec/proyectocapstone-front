import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { superAdminGuard } from '../../core/guards/super-admin.guard';
import { Admin } from './admin/admin';
import { CrearUsuario } from './admin/crear-usuario/crear-usuario';
import { Dashboard } from './admin/dashboard/dashboard';
import { SeccionMock, SeccionMockData } from './admin/seccion-mock/seccion-mock';
import { Login } from './login/login';

const pacientes: SeccionMockData = {
  titulo: 'Pacientes',
  descripcion: 'Listado de pacientes registrados.',
  columnas: ['Paciente', 'Edad', 'Psicólogo', 'Estado'],
  filas: [
    ['Juan Pérez', '28', 'Dra. Rojas', 'Activo'],
    ['María Torres', '34', 'Dr. Castillo', 'Activo'],
    ['Luis Ramos', '19', 'Dra. Rojas', 'En pausa'],
    ['Ana Flores', '41', 'Dr. Castillo', 'Activo'],
  ],
};

const psicologos: SeccionMockData = {
  titulo: 'Psicólogos',
  descripcion: 'Equipo de psicólogos y su carga de pacientes.',
  columnas: ['Psicólogo', 'Especialidad', 'Pacientes', 'Estado'],
  filas: [
    ['Dra. Rojas', 'Clínica', '18', 'Disponible'],
    ['Dr. Castillo', 'Infantil', '14', 'Disponible'],
    ['Dra. Vega', 'Pareja y familia', '11', 'De licencia'],
  ],
};

const citas: SeccionMockData = {
  titulo: 'Citas',
  descripcion: 'Agenda de citas programadas.',
  columnas: ['Fecha', 'Paciente', 'Psicólogo', 'Estado'],
  filas: [
    ['20/05 09:00', 'Juan Pérez', 'Dra. Rojas', 'Confirmada'],
    ['20/05 10:30', 'María Torres', 'Dr. Castillo', 'Pendiente'],
    ['20/05 12:00', 'Ana Flores', 'Dr. Castillo', 'Confirmada'],
    ['21/05 16:00', 'Luis Ramos', 'Dra. Rojas', 'Cancelada'],
  ],
};

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
  { path: 'login', component: Login },
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Dashboard },
      { path: 'usuarios', component: CrearUsuario, canActivate: [superAdminGuard] },
      { path: 'pacientes', component: SeccionMock, data: pacientes },
      { path: 'psicologos', component: SeccionMock, data: psicologos },
      { path: 'citas', component: SeccionMock, data: citas },
      { path: 'reportes', component: SeccionMock, data: reportes },
      { path: 'configuracion', component: SeccionMock, data: configuracion },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloRolesRoutingModule {}
