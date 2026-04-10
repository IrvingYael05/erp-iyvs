import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ----- Obtener Estadísticas del Grupo -----
  getTicketStats(groupId: string): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('groupId', groupId);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/tickets/stats`, { params });
  }

  // ----- Obtener Tickets -----
  getTickets(
    groupId: string,
    page: number = 1,
    limit: number = 10,
    filter?: string,
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('groupId', groupId).set('page', page).set('limit', limit);

    if (filter) {
      params = params.set('filter', filter);
    }

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/tickets`, { params });
  }

  // ----- Crear Ticket -----
  createTicket(ticketData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/tickets`, ticketData);
  }

  // ----- Editar Ticket -----
  updateTicket(ticketId: string, ticketData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/api/tickets/${ticketId}`, ticketData);
  }

  // ----- Eliminar un Ticket -----
  deleteTicket(ticketId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/api/tickets/${ticketId}`);
  }

  // ----- Agregar Comentario a un Ticket -----
  addTicketComment(ticketId: string, texto: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/api/tickets/${ticketId}/comments`, {
      texto,
    });
  }

  // ----- Obtener un Ticket por ID (Detalle completo) -----
  getTicketById(ticketId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/tickets/${ticketId}`);
  }

  // ----- Actualizar solo el estado del Ticket (Kanban Drag & Drop) -----
  updateTicketStatus(ticketId: string, estado: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/api/tickets/${ticketId}/status`, {
      estado,
    });
  }

  // ----- Obtener Mis Tickets -----
  getMyTickets(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/tickets/me`);
  }
}
