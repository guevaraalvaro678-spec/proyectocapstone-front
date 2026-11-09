import { CanMatchFn, Routes } from '@angular/router';

/**
 * Todos los módulos cuelgan de la raíz (`path: ''`), así que sin esto el router descargaba uno tras otro
 * hasta encontrar la ruta (entrar a /admin bajaba también el sitio público, voluntario, practicante y
 * postulante). Con este filtro cada módulo se descarga solo si la URL empieza con una de sus rutas.
 */
const soloRutas =
  (...rutas: string[]): CanMatchFn =>
  (_ruta, segmentos) =>
    segmentos.length > 0 && rutas.includes(segmentos[0].path);

export const routes: Routes = [
  // Espacio del voluntario: sus datos y sus futuras tareas.
  {
    path: '',
    canMatch: [soloRutas('voluntario')],
    loadChildren: () =>
      import('./Modulo-voluntario/modulo-voluntario-module').then((m) => m.ModuloVoluntarioModule),
  },
  // Espacio del practicante: sus datos, horario, asistencia y tareas.
  {
    path: '',
    canMatch: [soloRutas('practicante')],
    loadChildren: () =>
      import('./Modulo-practicante/modulo-practicante-module').then((m) => m.ModuloPracticanteModule),
  },
  // Portal del postulante: formulario de postulación y seguimiento.
  {
    path: '',
    canMatch: [soloRutas('postular', 'mi-postulacion', 'mi-cuenta-postulante')],
    loadChildren: () =>
      import('./Modulo-postulante/modulo-postulante-module').then((m) => m.ModuloPostulanteModule),
  },
  // Login, recuperar contraseña y panel de administrador / Recursos Humanos.
  {
    path: '',
    canMatch: [soloRutas('login', 'registro', 'olvide-password', 'restablecer', 'admin')],
    loadChildren: () =>
      import('./Modulo-roles/modulo-roles-module').then((m) => m.ModuloRolesModule),
  },
  // Sitio público e informativo (inicio, nosotros, iniciativas, donar, contacto, participar):
  // va al final porque recibe todo lo que no es de los módulos anteriores.
  {
    path: '',
    loadChildren: () =>
      import('./Modulo-web/modulo-web-module').then((m) => m.ModuloWebModule),
  },
  { path: '**', redirectTo: '' },
];
