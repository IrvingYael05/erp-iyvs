import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private storageKey = 'erp_grupos';

  constructor() {
    this.initGroups();
  }

  private initGroups() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      const defaultGroups = [
        {
          id: 1,
          nivel: 'Avanzado',
          autor: 'Administrador del Sistema',
          nombre: 'Desarrollo Frontend',
          integrantesList: ['admin@nexoserp.com'],
          ticketsList: [],
          descripcion: 'Equipo encargado de Angular',
          memberPermissions: {
            'admin@nexoserp.com': ['ticket:view', 'ticket:add', 'ticket:edit', 'ticket:delete'],
          },
        },
      ];
      this.saveToStorage(defaultGroups);
    }
  }

  private saveToStorage(groups: any[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(groups));
  }

  getGroups(): any[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  getGroupById(id: number): any {
    const groups = this.getGroups();
    return groups.find((g) => g.id === id) || null;
  }

  createGroup(group: any): any {
    const groups = this.getGroups();
    group.id = groups.length > 0 ? Math.max(...groups.map((g: any) => g.id)) + 1 : 1;

    if (group.integrantesList && group.integrantesList.length > 0) {
      const creadorEmail = group.integrantesList[0];
      group.memberPermissions = {
        [creadorEmail]: ['ticket:view', 'ticket:add', 'ticket:edit', 'ticket:delete'],
      };
    }

    groups.push(group);
    this.saveToStorage(groups);
    return group;
  }

  updateGroup(updatedGroup: any): void {
    const groups = this.getGroups();
    const index = groups.findIndex((g) => g.id === updatedGroup.id);
    if (index !== -1) {
      groups[index] = updatedGroup;
      this.saveToStorage(groups);
    }
  }

  deleteGroup(id: number): void {
    let groups = this.getGroups();
    groups = groups.filter((g) => g.id !== id);
    this.saveToStorage(groups);
  }

  addMember(groupId: number, email: string): void {
    const group = this.getGroupById(groupId);
    if (group) {
      if (!group.integrantesList) group.integrantesList = [];
      if (!group.integrantesList.includes(email)) {
        group.integrantesList.push(email);

        if (!group.memberPermissions) group.memberPermissions = {};

        group.memberPermissions[email] = [
          'ticket:view',
          'ticket:add',
          'ticket:edit',
          'ticket:delete',
        ];

        this.updateGroup(group);
      }
    }
  }

  removeMember(groupId: number, email: string): void {
    const group = this.getGroupById(groupId);
    if (group && group.integrantesList) {
      group.integrantesList = group.integrantesList.filter((e: string) => e !== email);

      if (group.memberPermissions && group.memberPermissions[email]) {
        delete group.memberPermissions[email];
      }

      this.updateGroup(group);
    }
  }

  addTicket(groupId: number, ticket: any): void {
    const group = this.getGroupById(groupId);
    if (group) {
      if (!group.ticketsList) group.ticketsList = [];
      ticket.id =
        group.ticketsList.length > 0 ? Math.max(...group.ticketsList.map((t: any) => t.id)) + 1 : 1;
      group.ticketsList.push(ticket);
      this.updateGroup(group);
    }
  }

  updateTicket(groupId: number, updatedTicket: any): void {
    const group = this.getGroupById(groupId);
    if (group && group.ticketsList) {
      const index = group.ticketsList.findIndex((t: any) => t.id === updatedTicket.id);
      if (index !== -1) {
        group.ticketsList[index] = updatedTicket;
        this.updateGroup(group);
      }
    }
  }

  deleteTicket(groupId: number, ticketId: number): void {
    const group = this.getGroupById(groupId);
    if (group && group.ticketsList) {
      group.ticketsList = group.ticketsList.filter((t: any) => t.id !== ticketId);
      this.updateGroup(group);
    }
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
    const group = this.getGroupById(groupId);
    if (!group || !group.ticketsList) return [];

    let tickets = group.ticketsList;

    switch (filterType) {
      case 'mis_tickets':
        return tickets.filter((t: any) => t.asignadoA === userEmail);
      case 'sin_asignar':
        return tickets.filter((t: any) => !t.asignadoA || t.asignadoA.trim() === '');
      case 'prioridad_alta':
        return tickets.filter((t: any) => t.prioridad === 'Alta');
      case 'todos':
      default:
        return tickets;
    }
  }

  getUserGroups(email: string): any[] {
    const groups = this.getGroups();
    return groups.filter(
      (g) => g.integrantesList && g.integrantesList.includes(email?.toLowerCase()),
    );
  }

  getTicketStats(email?: string): {
    total: number;
    pendientes: number;
    enProgreso: number;
    enRevision: number;
    finalizados: number;
  } {
    let groups = this.getGroups();

    if (email) {
      groups = groups.filter(
        (g) =>
          g.integrantesList &&
          g.integrantesList.includes(email.toLowerCase()) &&
          this.hasLocalPermission(g.id, email.toLowerCase(), 'ticket:view'),
      );
    }

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
    const group = this.getGroupById(groupId);
    let stats = { total: 0, pendientes: 0, enProgreso: 0, enRevision: 0, finalizados: 0 };

    if (group && group.ticketsList) {
      stats.total = group.ticketsList.length;
      stats.pendientes = group.ticketsList.filter((t: any) => t.estado === 'Pendiente').length;
      stats.enProgreso = group.ticketsList.filter((t: any) => t.estado === 'En Progreso').length;
      stats.enRevision = group.ticketsList.filter((t: any) => t.estado === 'Revisión').length;
      stats.finalizados = group.ticketsList.filter((t: any) => t.estado === 'Finalizado').length;
    }
    return stats;
  }

  hasLocalPermission(groupId: number, email: string, permission: string): boolean {
    const group = this.getGroupById(groupId);
    if (!group || !group.memberPermissions || !group.memberPermissions[email]) {
      return false;
    }
    return group.memberPermissions[email].includes(permission);
  }

  updateMemberPermissions(groupId: number, email: string, permissions: string[]): void {
    const group = this.getGroupById(groupId);
    if (group) {
      if (!group.memberPermissions) group.memberPermissions = {};
      group.memberPermissions[email] = permissions;
      this.updateGroup(group);
    }
  }
}
