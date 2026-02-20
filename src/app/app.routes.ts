import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login').then((c) => c.Login),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register').then((c) => c.Register),
  },
];
