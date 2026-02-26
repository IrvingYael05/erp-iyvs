import { Component } from '@angular/core';
import { MainLayout } from '../../layout/main-layout/main-layout';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MainLayout, CardModule, TimelineModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  kpis = [
    { title: 'Ventas del Mes', value: '$45,231.00', icon: 'pi pi-dollar', color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Nuevos Clientes', value: '128', icon: 'pi pi-user-plus', color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Órdenes Pendientes', value: '34', icon: 'pi pi-shopping-bag', color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Alertas Inventario', value: '5', icon: 'pi pi-exclamation-triangle', color: 'text-red-600', bg: 'bg-red-100' }
  ];

  // Datos para el componente Timeline de PrimeNG
  actividadReciente = [
    { status: 'Nueva venta registrada', date: 'Hace 10 minutos', icon: 'pi pi-shopping-cart', color: '#10b981' },
    { status: 'Inventario actualizado', date: 'Hace 2 horas', icon: 'pi pi-box', color: '#f97316' },
    { status: 'Cierre de caja', date: 'Ayer', icon: 'pi pi-wallet', color: '#64748b' },
    { status: 'Nuevo usuario registrado', date: 'Ayer', icon: 'pi pi-user-plus', color: '#3b82f6' }
  ];
}