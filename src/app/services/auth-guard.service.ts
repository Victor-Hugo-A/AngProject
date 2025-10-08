import { CanActivateFn} from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('auth_token');
  return !!token; // se quiser, cheque expiração
}

// canActivate para rotas públicas (ex.: login)
export const anonOnlyGuard: CanActivateFn = () => {
  return !localStorage.getItem('auth_token');
};
