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
}
