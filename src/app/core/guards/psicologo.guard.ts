import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Panel del psicólogo: solo cuentas con rol Psicólogo. Cualquier otra va a su propio lugar. */
export const psicologoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esPsicologo()) return true;

  return router.createUrlTree([auth.autenticado() ? auth.rutaInicial() : '/login']);
};
