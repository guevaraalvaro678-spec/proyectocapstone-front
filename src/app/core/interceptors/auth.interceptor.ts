import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { API_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';

/** Agrega el token a las peticiones a la API y cierra la sesión si el token ya no es válido. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.sesion()?.token;

  if (!token || !req.url.startsWith(API_URL)) {
    return next(req);
  }

  const conToken = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(conToken).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
