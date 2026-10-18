import { Routes } from '@angular/router';

export const routes: Routes = [
  // Sitio público e informativo: inicio, nosotros, servicios, contacto y únete.
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-web/modulo-web-module').then((m) => m.ModuloWebModule),
  },
  // Espacio del voluntario: sus datos y sus futuras tareas.
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-voluntario/modulo-voluntario-module').then((m) => m.ModuloVoluntarioModule),
  },
  // Espacio del practicante: sus datos, horario, asistencia y tareas.
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-practicante/modulo-practicante-module').then((m) => m.ModuloPracticanteModule),
  },
  // Portal del postulante: formulario de postulación y seguimiento.
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-postulante/modulo-postulante-module').then((m) => m.ModuloPostulanteModule),
  },
  // Login, recuperar contraseña y panel de administrador / Recursos Humanos.
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-roles/modulo-roles-module').then((m) => m.ModuloRolesModule),
  },
  { path: '**', redirectTo: '' },
];
