import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { authGuard, guestGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    pathMatch: 'full',
    canActivate: [guestGuard],
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login').then((c) => c.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register').then((c) => c.Register),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((c) => c.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((c) => c.NotFound),
  },
];
