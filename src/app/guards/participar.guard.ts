import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../Modulo-compartido/Services/auth.service';

/**
 * Botón "Participar": sin sesión lleva a crear la cuenta; el postulante va a su formulario;
 * quien ya es miembro (o del equipo) va a su espacio. Conserva ?tipo=Voluntario|Practicante.
 */
export const participarGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const tipo = route.queryParamMap.get('tipo');
  const queryParams = tipo ? { tipo } : {};

  // Sin cuenta: directo al formulario; la cuenta (Google o correo) se crea al enviarlo.
  if (!auth.autenticado()) return router.createUrlTree(['/postular'], { queryParams });
  if (auth.esPostulante()) return router.createUrlTree(['/postular'], { queryParams });
  return router.createUrlTree([auth.rutaInicial()]);
};
