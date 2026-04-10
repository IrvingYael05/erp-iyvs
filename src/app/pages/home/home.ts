import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayout } from '../../layout/main-layout/main-layout';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { GroupService } from '../../core/services/group/group';
import { TicketService } from '../../core/services/ticket/ticket';
import { Permission } from '../../core/services/permission/permission';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MainLayout, CardModule, ButtonModule, ChartModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private groupService = inject(GroupService);
  private ticketService = inject(TicketService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private permissionService = inject(Permission);

  kpis: any[] = [];
  grupos: any[] = [];

  chartData: any;
  chartOptions: any;

  isLoading: boolean = true;

  ngOnInit() {
    this.cargarDashboard();
    this.cargarGrupos();
  }

  cargarDashboard() {
    this.ticketService.getMyTickets().subscribe({
      next: (res) => {
        this.isLoading = true;

        const misTickets = res.data[0]?.tickets ?? [];
        const total = res.data[0]?.totalRecords ?? 0;

        const stats = {
          total: total,
          pendientes: misTickets.filter((t: any) => t.estado === 'Pendiente').length,
          enProgreso: misTickets.filter((t: any) => t.estado === 'En Progreso').length,
          enRevision: misTickets.filter((t: any) => t.estado === 'Revisión').length,
          finalizados: misTickets.filter((t: any) => t.estado === 'Finalizado').length,
        };

        this.kpis = [
          {
            title: 'Total de Tickets',
            value: stats.total,
            icon: 'pi pi-ticket',
            color: 'text-purple-600',
            bg: 'bg-purple-100',
          },
          {
            title: 'Pendientes',
            value: stats.pendientes,
            icon: 'pi pi-clock',
            color: 'text-slate-600',
            bg: 'bg-slate-100',
          },
          {
            title: 'En Progreso',
            value: stats.enProgreso,
            icon: 'pi pi-cog',
            color: 'text-blue-600',
            bg: 'bg-blue-100',
          },
          {
            title: 'En Revisión',
            value: stats.enRevision,
            icon: 'pi pi-eye',
            color: 'text-orange-600',
            bg: 'bg-orange-100',
          },
        ];

        this.initChart(stats);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  initChart(stats: any) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    this.chartData = {
      labels: ['Pendientes', 'En Progreso', 'En Revisión', 'Finalizados'],
      datasets: [
        {
          data: [stats.pendientes, stats.enProgreso, stats.enRevision, stats.finalizados],
          backgroundColor: [
            documentStyle.getPropertyValue('--p-slate-500'),
            documentStyle.getPropertyValue('--p-blue-500'),
            documentStyle.getPropertyValue('--p-orange-500'),
            documentStyle.getPropertyValue('--p-green-500'),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--p-slate-400'),
            documentStyle.getPropertyValue('--p-blue-400'),
            documentStyle.getPropertyValue('--p-orange-400'),
            documentStyle.getPropertyValue('--p-green-400'),
          ],
        },
      ],
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor,
          },
        },
      },
    };
  }

  cargarGrupos() {
    this.isLoading = true;
    this.groupService.getMyGroups().subscribe({
      next: (res) => {
        this.grupos = res.data[0]?.groups || res.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = true;
        this.cdr.detectChanges();
      },
    });
  }

  goToGroup(id: string) {
    this.router.navigate(['/group', id]);
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }
}
