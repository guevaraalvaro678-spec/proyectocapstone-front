import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloRolesRoutingModule } from './modulo-roles-routing-module';
import { Login } from './login/login';
import { Admin } from './admin/admin';
import { CrearUsuario } from './admin/crear-usuario/crear-usuario';
import { Dashboard } from './admin/dashboard/dashboard';
import { SeccionMock } from './admin/seccion-mock/seccion-mock';
import { Mensajes } from './admin/mensajes/mensajes';
import { Eventos } from './admin/eventos/eventos';
import { SitioWeb } from './admin/sitio-web/sitio-web';
import { Asistencia } from './admin/asistencia/asistencia';
import { Practicantes } from './admin/practicantes/practicantes';
import { Tareas } from './admin/tareas/tareas';
import { Voluntarios } from './admin/voluntarios/voluntarios';
import { OlvidePassword } from './olvide-password/olvide-password';
import { Restablecer } from './restablecer/restablecer';
import { Usuarios } from './admin/usuarios/usuarios';
import { Correos } from './admin/correos/correos';

@NgModule({
  declarations: [
    Login,
    Admin,
    CrearUsuario,
    Dashboard,
    SeccionMock,
    Mensajes,
    Eventos,
    SitioWeb,
    Asistencia,
    Practicantes,
    Tareas,
    Voluntarios,
    OlvidePassword,
    Restablecer,
    Usuarios,
    Correos,
  ],
  imports: [CommonModule, ReactiveFormsModule, ModuloRolesRoutingModule],
})
export class ModuloRolesModule {}
