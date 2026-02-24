import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Arreglo temporal que simula la base de datos
  private users: any[] = [
    {
      usuario: 'admin',
      email: 'admin@nexoserp.com',
      nombreCompleto: 'Administrador del Sistema',
      direccion: 'Oficina Central',
      telefono: '1234567890',
      fechaNacimiento: new Date('1990-01-01'),
      password: 'AdminPassword123!' 
    }
  ];

  // Almacena el usuario logueado actualmente (localStorage)
  private currentUser: any = null;
  private readonly SESSION_KEY = 'erp_user_session';

  constructor() {
    const savedSession = localStorage.getItem(this.SESSION_KEY);
    if (savedSession) {
      this.currentUser = JSON.parse(savedSession);
    }
  }

  // Método para guardar registro
  registerUser(userData: any) {
    this.users.push(userData);
  }

  // Método para hacer login
  login(usuario: string, password: string): boolean {
    const user = this.users.find(u => u.usuario === usuario && u.password === password);
    if (user) {
      this.currentUser = user;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.SESSION_KEY) !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}