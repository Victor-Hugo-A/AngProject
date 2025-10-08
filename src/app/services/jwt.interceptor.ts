// jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // NÃO anexar Bearer às rotas públicas
  if (req.url.startsWith('/auth/')) {
    return next(req);
  }

  const token = localStorage.getItem('auth_token');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        // evite injetar Router aqui
        window.location.href = '/login';
      }
      return throwError(() => err);
    })
  );
};
