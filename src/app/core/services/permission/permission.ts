import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth/auth';

@Injectable({
  providedIn: 'root',
})
export class Permission {
  private authService = inject(AuthService);

  hasPermission(permission: string | string[]): boolean {
    const user = this.authService.getCurrentUser();

    if (!user || !user.permissions) {
      return false;
    }

    if (Array.isArray(permission)) {
      return permission.some((p) => user.permissions.includes(p));
    }

    return user.permissions.includes(permission);
  }
}
