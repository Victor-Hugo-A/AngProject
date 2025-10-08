import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('auth_token');
  return !!token; // simples: só exige token
};

// src/app/guards/anon-only.guard.ts (opcional)
export const anonOnlyGuard: CanActivateFn = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    window.location.href = '/user';
    return false;
  }
  return true;
};
