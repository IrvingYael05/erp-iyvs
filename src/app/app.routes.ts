import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { authGuard, guestGuard, permissionGuard } from './core/guards/auth-guard';

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
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((c) => c.Home),
    canActivate: [authGuard],
  },
  {
    path: 'group',
    loadComponent: () => import('./pages/groups/group/group').then((c) => c.Group),
    canActivate: [authGuard, permissionGuard],
    data: { permission: 'group:view' },
  },
  {
    path: 'group/:id',
    loadComponent: () =>
      import('./pages/groups/group-detail/group-detail').then((c) => c.GroupDetail),
    canActivate: [authGuard, permissionGuard],
    data: { permission: 'group-detail:view' },
  },
  {
    path: 'user',
    loadComponent: () => import('./pages/user/user').then((c) => c.User),
    canActivate: [authGuard, permissionGuard],
    data: { permission: 'user:view' },
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin-users/admin-users').then((c) => c.AdminUsers),
    canActivate: [authGuard, permissionGuard],
    data: { permission: 'user-manage:view' },
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((c) => c.NotFound),
  },
];
