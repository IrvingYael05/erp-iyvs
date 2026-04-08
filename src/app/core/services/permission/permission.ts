import { Injectable, inject } from '@angular/core';
import { UsersService } from '../users/users';

@Injectable({
  providedIn: 'root',
})
export class Permission {
  private UsersService = inject(UsersService);

  hasPermission(permission: string | string[]): boolean {
    const user = this.UsersService.getCurrentUser();

    if (!user || !user.permissions) {
      return false;
    }

    if (Array.isArray(permission)) {
      return permission.some((p) => user.permissions.includes(p));
    }

    return user.permissions.includes(permission);
  }
}
