import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<any>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  // Autenticación
  // ----- Login -----
  login(email: string, password: string): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.data && response.data[0]) {
            const payload = response.data[0];
            if (payload.token) localStorage.setItem('token', payload.token);

            if (payload.usuario) {
              localStorage.setItem('currentUser', JSON.stringify(payload.usuario));

              this.currentUserSubject.next(payload.usuario);
            }
          }
        }),
      );
  }

  // ----- Logout -----
  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/auth/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      }),
    );
  }

  // ----- Obtener usuario actual bd -----
  fetchCurrentUser(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/users/me`).pipe(
      tap((response) => {
        if (response.data && response.data[0]) {
          localStorage.setItem('currentUser', JSON.stringify(response.data[0]));
          this.currentUserSubject.next(response.data[0]);
        }
      }),
    );
  }

  // ----- Registro -----
  register(userData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/auth/register`, userData);
  }

  // ----- Recuperar Contraseña -----
  recoverPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/auth/recover`, { email });
  }

  // ----- Cambiar Contraseña (Recuperación) -----
  resetPassword(newPassword: string, recoveryToken: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/api/auth/reset`,
      { newPassword },
      {
        headers: {
          Authorization: `Bearer ${recoveryToken}`,
        },
      },
    );
  }

  // Usuarios
  // ----- Obtener usuario actual local -----
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ----- Verificar si el usuario está logueado local -----
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ----- Actualizar Perfil -----
  updateProfile(profileData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/users/me`, profileData).pipe(
      tap(() => {
        this.fetchCurrentUser().subscribe();
      }),
    );
  }

  // ----- Cambiar Contraseña (Perfil) -----
  changePassword(oldPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/users/me/password`, {
      oldPassword,
      newPassword,
    });
  }

  // ----- Eliminar Cuenta -----
  deleteAccount(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/api/users/me`).pipe(
      tap(() => {
        this.logout().subscribe();
        this.currentUserSubject.next(null);
      }),
    );
  }

  // Administración
  // ----- Obtener usuarios con paginación -----
  getUsers(page: number = 1, limit: number = 10, search?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/admin/users`, { params });
  }

  // ----- Crear nuevo usuario -----
  createUser(userData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/admin/users`, userData);
  }

  // ----- Actualizar permisos -----
  updatePermissions(userId: string, permissions: string[]): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/admin/users/${userId}/permissions`, {
      permissions,
    });
  }

  // ----- Eliminar usuario -----
  deleteUser(userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/api/admin/users/${userId}`);
  }
}
