import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../Modulo-compartido/Services/auth.service';

/** Espacio del practicante: solo cuentas con rol Practicante. */
export const practicanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esPracticante()) return true;

  return router.createUrlTree([auth.autenticado() ? auth.rutaInicial() : '/login']);
};
