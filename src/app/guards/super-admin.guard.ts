import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../Modulo-compartido/Services/auth.service';

/** Solo deja pasar a un SuperAdmin; a los demás los manda al dashboard. */
export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.esSuperAdmin() ? true : router.createUrlTree(['/admin/dashboard']);
};
