import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() {
    this.initGroups();
  }

  private initGroups() {}

  // Grupos
  // ----- Obtener Grupos -----
  getGroups(page: number = 1, limit: number = 5, search?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/groups`, { params });
  }

  // ----- Crear Grupo -----
  createGroup(groupData: {
    nombre: string;
    descripcion: string;
    nivel: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/groups`, groupData);
  }

  // ----- Actualizar Grupo -----
  updateGroup(
    groupId: string,
    groupData: { nombre: string; descripcion: string; nivel: string },
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/groups/${groupId}`, groupData);
  }

  // ----- Eliminar Grupo -----
  deleteGroup(groupId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/api/groups/${groupId}`);
  }

  // ----- Obtener Grupo por ID -----
  getGroupById(groupId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/groups/${groupId}`);
  }

  // Gestión de Grupo
  // ----- Obtener Miembros -----
  getGroupMembers(
    groupId: string,
    page: number = 1,
    limit: number = 5,
    search?: string,
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/groups/${groupId}/members`, {
      params,
    });
  }

  // ----- Agregar Miembro -----
  addGroupMember(groupId: string, email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/groups/${groupId}/members`, {
      email,
    });
  }

  // ----- Actualizar Permisos Locales -----
  updateMemberPermissions(
    groupId: string,
    userId: string,
    permissions: string[],
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/api/groups/${groupId}/members/${userId}/permissions`,
      { permissions },
    );
  }

  // ----- Remover Miembro -----
  removeMember(groupId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/api/groups/${groupId}/members/${userId}`,
    );
  }

  // Estadísticas
  // ----- Obtener Mis Grupos -----
  getMyGroups(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/groups/me`);
  }

  // Se usa en Perfil
  getUserTickets(email: string): any[] {
    const groups = this.getGroups();
    let userTickets: any[] = [];

    groups.forEach((g: any) => {
      if (g.ticketsLis) {
        const tickets = g.ticketsList.filter((t: any) => t.asignadoA === email);
        tickets.forEach((t: any) =>
          userTickets.push({ ...t, grupoNombre: g.nombre, grupoId: g.id }),
        );
      }
    });

    return userTickets;
  }

  // Se usa en Perfil
  getUserTicketStats(email: string): any {
    const tickets = this.getUserTickets(email);
    return {
      total: tickets.length,
      abiertos: tickets.filter((t) => t.estado === 'Pendiente').length,
      enProgreso: tickets.filter((t) => t.estado === 'En Progreso').length,
      revision: tickets.filter((t) => t.estado === 'Revisión').length,
      hechos: tickets.filter((t) => t.estado === 'Finalizado').length,
    };
  }

  // Se usa en Home
  getUserGroups(email: string): any[] {
    const groups = this.getGroups();
    // return groups.filter(
    //   (g) => g.integrantesList && g.integrantesList.includes(email?.toLowerCase()),
    // );
    return [];
  }
}
