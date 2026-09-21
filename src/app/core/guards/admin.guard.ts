import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Panel de gestión: administradores y Recursos Humanos. Cualquier otra cuenta va a su propio lugar. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esGestion()) return true;

  return router.createUrlTree([auth.autenticado() ? auth.rutaInicial() : '/login']);
};

/** Secciones que Recursos Humanos no ve: solo SuperAdmin y Admin. */
export const soloAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esAdmin()) return true;

  return router.createUrlTree([auth.autenticado() ? auth.rutaInicial() : '/login']);
};
