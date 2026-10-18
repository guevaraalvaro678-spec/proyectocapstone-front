import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloCompartidoModule } from '../modulo-compartido/modulo-compartido-module';
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
import { ModuloRolesRoutingModule } from './modulo-roles-routing-module';
import { OlvidePassword } from './olvide-password/olvide-password';
import { Registro } from './registro/registro';
import { Restablecer } from './restablecer/restablecer';

/** Acceso (login, crear cuenta, recuperar contraseña) y el panel de administración / Recursos Humanos. */
@NgModule({
  declarations: [
    Login,
    Registro,
    OlvidePassword,
    Restablecer,
    Admin,
    Dashboard,
    Postulaciones,
    Entrevistas,
    Miembros,
    Practicantes,
    Tareas,
    Asistencia,
    Eventos,
    GestionIniciativas,
    Noticias,
    Donaciones,
    Usuarios,
    CrearUsuario,
    Mensajes,
    Correos,
    Configuracion,
  ],
  imports: [CommonModule, ReactiveFormsModule, ModuloCompartidoModule, ModuloRolesRoutingModule],
})
export class ModuloRolesModule {}
