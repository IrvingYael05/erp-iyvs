import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersKey = 'erp_users';
  private currentUserKey = 'erp_current_user';

  private users: any[] = [];
  private currentUser: any = null;

  constructor() {
    this.loadUsers();
    this.loadCurrentUser();
  }

  private loadUsers() {
    const stored = localStorage.getItem(this.usersKey);
    if (stored) {
      this.users = JSON.parse(stored);
    } else {
      this.users = [
        {
          usuario: 'admin',
          email: 'admin@nexoserp.com',
          nombreCompleto: 'Administrador del Sistema',
          direccion: 'Oficina Central',
          telefono: '1234567890',
          fechaNacimiento: new Date('1990-01-01'),
          password: 'AdminPassword123!',
          permissions: [
            'group:view',
            'group:add',
            'group:edit',
            'group:delete',
            'user:view',
            'user:edit',
            'user:delete',
          ],
        },
      ];
      this.saveUsers();
    }
  }

  private loadCurrentUser() {
    const stored = localStorage.getItem(this.currentUserKey);
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
  }

  private saveUsers() {
    localStorage.setItem(this.usersKey, JSON.stringify(this.users));
  }

  private saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(this.currentUserKey);
    }
  }

  registerUser(userData: any) {
    userData.permissions = ['group:view', 'user:view', 'user:edit'];
    this.users.push(userData);
    this.saveUsers();
  }

  login(usuario: string, password: string): boolean {
    const user = this.users.find((u) => u.usuario === usuario && u.password === password);
    if (user) {
      this.currentUser = user;
      this.saveCurrentUser();
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser = null;
    this.saveCurrentUser();
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  updateUser(updatedData: any) {
    const index = this.users.findIndex((u) => u.usuario === updatedData.usuario);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updatedData };
      this.saveUsers();

      if (this.currentUser && this.currentUser.usuario === updatedData.usuario) {
        this.currentUser = { ...this.currentUser, ...updatedData };
        this.saveCurrentUser();
      }
    }
  }

  deleteUser(usuario: string) {
    this.users = this.users.filter((u) => u.usuario !== usuario);
    this.saveUsers();

    if (this.currentUser && this.currentUser.usuario === usuario) {
      this.logout();
    }
  }
}
