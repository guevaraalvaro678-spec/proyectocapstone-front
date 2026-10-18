import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Portal del postulante. El formulario también lo ve quien aún no tiene cuenta:
 * llena el formulario y la cuenta se crea al enviarlo. Sin nada de eso, va a crear su cuenta.
 */
export const postulanteGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);


  if (auth.esPostulante()) return true;
  if (!auth.autenticado() && route.firstChild?.routeConfig?.path === 'postular') return true;

  return router.createUrlTree([auth.autenticado() ? auth.rutaInicial() : '/registro']);
};
