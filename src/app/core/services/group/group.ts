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
    group.id = groups.length > 0 ? Math.max(...groups.map((g) => g.id)) + 1 : 1;
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
        this.updateGroup(group);
      }
    }
  }

  removeMember(groupId: number, email: string): void {
    const group = this.getGroupById(groupId);
    if (group && group.integrantesList) {
      group.integrantesList = group.integrantesList.filter((e: string) => e !== email);
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

  getTicketStats(): {
    total: number;
    pendientes: number;
    enProgreso: number;
    enRevision: number;
    finalizados: number;
  } {
    const groups = this.getGroups();
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
}
