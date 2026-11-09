import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ModuloCompartidoModule } from '../Modulo-compartido/modulo-compartido-module';
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
import { ModuloRolesRoutingModule } from './modulo-roles-routing-module';
import { OlvidePassword } from './Components/rol-olvide-password/rol-olvide-password';
import { Registro } from './Components/rol-registro/rol-registro';
import { Restablecer } from './Components/rol-restablecer/rol-restablecer';
import { AlertasSeguridadPanel } from './Components/rol-alertas-seguridad/rol-alertas-seguridad';
import { Anuncios } from './Components/rol-anuncios/rol-anuncios';
import { Bandeja } from './Components/rol-bandeja/rol-bandeja';
import { IndicadoresProcesoPanel } from './Components/rol-indicadores-proceso/rol-indicadores-proceso';
import { Respaldos } from './Components/rol-respaldos/rol-respaldos';

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
    Bandeja,
    Anuncios,
    Respaldos,
    IndicadoresProcesoPanel,
    AlertasSeguridadPanel,
  ],
  imports: [CommonModule, ReactiveFormsModule, ModuloCompartidoModule, ModuloRolesRoutingModule],
})
export class ModuloRolesModule {}
