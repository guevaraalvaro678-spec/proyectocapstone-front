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
import { Solicitudes } from './admin/solicitudes/solicitudes';
import { Eventos } from './admin/eventos/eventos';
import { OlvidePassword } from './olvide-password/olvide-password';
import { Restablecer } from './restablecer/restablecer';
import { Usuarios } from './admin/usuarios/usuarios';
import { Psicologos } from './admin/psicologos/psicologos';
import { Citas } from './admin/citas/citas';
import { Correos } from './admin/correos/correos';
import { Colaboradores } from './admin/colaboradores/colaboradores';

@NgModule({
  declarations: [
    Login,
    Admin,
    CrearUsuario,
    Dashboard,
    SeccionMock,
    Mensajes,
    Solicitudes,
    Eventos,
    OlvidePassword,
    Restablecer,
    Usuarios,
    Psicologos,
    Citas,
    Correos,
    Colaboradores,
  ],
  imports: [CommonModule, ReactiveFormsModule, ModuloRolesRoutingModule],
})
export class ModuloRolesModule {}
