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

  addTicket(groupId: number, ticket: any): void {
    // const group = this.getGroupById(groupId);
    // if (group) {
    //   if (!group.ticketsList) group.ticketsList = [];
    //   ticket.id =
    //     group.ticketsList.length > 0 ? Math.max(...group.ticketsList.map((t: any) => t.id)) + 1 : 1;
    //   group.ticketsList.push(ticket);
    //   // this.updateGroup(group);
    // }
  }

  updateTicket(groupId: number, updatedTicket: any): void {
    // const group = this.getGroupById(groupId);
    // if (group && group.ticketsList) {
    //   const index = group.ticketsList.findIndex((t: any) => t.id === updatedTicket.id);
    //   if (index !== -1) {
    //     group.ticketsList[index] = updatedTicket;
    //     // this.updateGroup(group);
    //   }
    // }
  }

  deleteTicket(groupId: number, ticketId: number): void {
    // const group = this.getGroupById(groupId);
    // if (group && group.ticketsList) {
    //   group.ticketsList = group.ticketsList.filter((t: any) => t.id !== ticketId);
    //   // this.updateGroup(group);
    // }
  }

  getUserTickets(email: string): any[] {
    const groups = this.getGroups();
    let userTickets: any[] = [];

    groups.forEach((g: any) => {
      if (g.ticketsList && this.hasLocalPermission(g.id, email, 'ticket:view')) {
        const tickets = g.ticketsList.filter((t: any) => t.asignadoA === email);
        tickets.forEach((t: any) =>
          userTickets.push({ ...t, grupoNombre: g.nombre, grupoId: g.id }),
        );
      }
    });

    return userTickets;
  }

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

  getGroupTicketsFiltered(groupId: number, filterType: string, userEmail: string): any[] {
    // const group = this.getGroupById(groupId);
    // if (!group || !group.ticketsList) return [];

    // let tickets = group.ticketsList;

    // switch (filterType) {
    //   case 'mis_tickets':
    //     return tickets.filter((t: any) => t.asignadoA === userEmail);
    //   case 'sin_asignar':
    //     return tickets.filter((t: any) => !t.asignadoA || t.asignadoA.trim() === '');
    //   case 'prioridad_alta':
    //     return tickets.filter((t: any) => t.prioridad === 'Alta');
    //   case 'todos':
    //   default:
    //     return tickets;
    // }
    return [];
  }

  getUserGroups(email: string): any[] {
    const groups = this.getGroups();
    // return groups.filter(
    //   (g) => g.integrantesList && g.integrantesList.includes(email?.toLowerCase()),
    // );
    return [];
  }

  getTicketStats(email?: string): {
    total: number;
    pendientes: number;
    enProgreso: number;
    enRevision: number;
    finalizados: number;
  } {
    let groups = this.getGroups();

    // if (email) {
    //   groups = groups.filter(
    //     (g) =>
    //       g.integrantesList &&
    //       g.integrantesList.includes(email.toLowerCase()) &&
    //       this.hasLocalPermission(g.id, email.toLowerCase(), 'ticket:view'),
    //   );
    // }

    let stats = { total: 0, pendientes: 0, enProgreso: 0, enRevision: 0, finalizados: 0 };

    groups.forEach((g: any) => {
      if (g.ticketsList) {
        stats.total += g.ticketsList.length;
        stats.pendientes += g.ticketsList.filter((t: any) => t.estado === 'Pendiente').length;
        stats.enProgreso += g.ticketsList.filter((t: any) => t.estado === 'En Progreso').length;
        stats.enRevision += g.ticketsList.filter((t: any) => t.estado === 'Revisión').length;
        stats.finalizados += g.ticketsList.filter((t: any) => t.estado === 'Finalizado').length;
      }
    });

    return stats;
  }

  getGroupTicketStats(groupId: number): any {
    // const group = this.getGroupById(groupId);
    // let stats = { total: 0, pendientes: 0, enProgreso: 0, enRevision: 0, finalizados: 0 };
    // if (group && group.ticketsList) {
    //   stats.total = group.ticketsList.length;
    //   stats.pendientes = group.ticketsList.filter((t: any) => t.estado === 'Pendiente').length;
    //   stats.enProgreso = group.ticketsList.filter((t: any) => t.estado === 'En Progreso').length;
    //   stats.enRevision = group.ticketsList.filter((t: any) => t.estado === 'Revisión').length;
    //   stats.finalizados = group.ticketsList.filter((t: any) => t.estado === 'Finalizado').length;
    // }
    // return stats;
  }

  hasLocalPermission(groupId: number, email: string, permission: string): boolean {
    // const group = this.getGroupById(groupId);
    // if (!group || !group.memberPermissions || !group.memberPermissions[email]) {
    //   return false;
    // }
    return true;
  }
}
