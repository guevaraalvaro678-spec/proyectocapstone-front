import { Routes } from '@angular/router';

export const routes: Routes = [
  // Sitio público e informativo: inicio, nosotros, servicios y contacto.
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-web/modulo-web-module').then((m) => m.ModuloWebModule),
  },
  // Registro y "Mi espacio" del usuario común (reservar citas, sus solicitudes y preferencias).
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-usuario/modulo-usuario-module').then((m) => m.ModuloUsuarioModule),
  },
  // Panel del psicólogo: su agenda, sus horarios y las solicitudes que le asignaron.
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-psicologo/modulo-psicologo-module').then((m) => m.ModuloPsicologoModule),
  },
  // Login, recuperar contraseña y panel de administrador.
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-roles/modulo-roles-module').then((m) => m.ModuloRolesModule),
  },
  { path: '**', redirectTo: '' },
];
