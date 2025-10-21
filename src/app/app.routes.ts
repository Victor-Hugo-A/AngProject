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

  { path: 'tickets',      loadComponent: () => import('./pages/tickets/list/list').then(m => m.TicketsListComponent), canActivate: [authGuard] },
  { path: 'tickets/new',  loadComponent: () => import('./pages/tickets/new/new').then(m => m.TicketFormComponent),    canActivate: [authGuard] },

  { path: 'knowledge', loadComponent: () => import('./pages/knowledge/knowledge').then(m => m.KnowledgeComponent), canActivate: [authGuard] },
  { path: 'profile',   loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),       canActivate: [authGuard] },

  { path: 'tickets/:id', loadComponent: () => import('./pages/tickets/details/detail').then(m => m.TicketDetailComponent) },


  // rota pós-login (protegida)
  { path: 'user', canActivate: [authGuard], loadComponent: () =>
      import('./pages/user/user').then(m => m.UserComponent) },

  { path: '**', redirectTo: 'login' }
];
