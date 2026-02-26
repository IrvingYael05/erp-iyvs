import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth'; 
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, ButtonModule, PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuItems: MenuItem[] = [
    { label: 'Inicio', icon: 'pi pi-home', routerLink: '/home' },
    { 
      label: 'Inventario', 
      icon: 'pi pi-box',
      items: [
        { label: 'Productos', icon: 'pi pi-list', routerLink: '/home' },
        { label: 'Categorías', icon: 'pi pi-tags', routerLink: '/home' }
      ]
    },
    { label: 'Ventas', icon: 'pi pi-shopping-cart', routerLink: '/home' },
    { label: 'Empleados', icon: 'pi pi-users', routerLink: '/home' },
    { label: 'Reportes', icon: 'pi pi-chart-bar', routerLink: '/home' },
  ];

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}