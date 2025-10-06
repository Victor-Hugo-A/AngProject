import { Routes } from '@angular/router';
import {authGuard} from './services/auth-guard.service';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent) },

  { path: 'signup', loadComponent: () =>
      import('./pages/signup/signup').then(m => m.SignupComponent) },

  { path: 'forgot', loadComponent: () =>
      import('./pages/forgot/forgot').then(m => m.ForgotComponent) },

  // rota pós-login (protegida)
  { path: 'user', canActivate: [authGuard], loadComponent: () =>
      import('./pages/user/user').then(m => m.UserComponent) },

  { path: '**', redirectTo: 'login' }
];
