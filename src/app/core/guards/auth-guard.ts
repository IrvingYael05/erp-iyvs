import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersService } from '../services/users/users';
import { Permission } from '../services/permission/permission';

// Rutas con Auth
export const authGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);

  if (usersService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/']);
};

//Rutas sin Auth
export const guestGuard: CanActivateFn = (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);

  if (usersService.isLoggedIn()) {
    return router.createUrlTree(['/home']);
  }

  return true;
};

// Rutas con permisos específicos
export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(Permission);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string | string[];

  if (!requiredPermission || permissionService.hasPermission(requiredPermission)) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
