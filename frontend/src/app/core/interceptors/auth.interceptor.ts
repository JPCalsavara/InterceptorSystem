import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const isInternalApi = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api/');

  if (token && isInternalApi) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado ou inválido - fazer logout e redirecionar
          console.warn('Sessão expirada. Redirecionando para login...');
          authService.logout();
        }
        return throwError(() => error);
      }),
    );
  }

  return next(req);
};
