import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '',
    loadChildren: () =>
      import('./modules/modulo-roles/modulo-roles-module').then((m) => m.ModuloRolesModule),
  },
  { path: '**', redirectTo: 'login' },
];
