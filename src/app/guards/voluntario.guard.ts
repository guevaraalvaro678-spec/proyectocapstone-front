import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../Modulo-compartido/Services/auth.service';

/** Espacio del voluntario: solo cuentas con rol Voluntario. */
export const voluntarioGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esVoluntario()) return true;

  return router.createUrlTree([auth.autenticado() ? auth.rutaInicial() : '/login']);
};
