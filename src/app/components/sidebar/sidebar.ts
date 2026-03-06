import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth';
import { Permission } from '../../core/services/permission/permission'; // Importar el servicio
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, ButtonModule, PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private authService = inject(AuthService);
  private permissionService = inject(Permission); // Inyectar
  private router = inject(Router);

  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.buildMenu();
  }

  buildMenu() {
    this.menuItems = [{ label: 'Inicio', icon: 'pi pi-home', routerLink: '/home' }];

    if (this.permissionService.hasPermission('group:view')) {
      this.menuItems.push({ label: 'Gestión de Grupos', icon: 'pi pi-users', routerLink: '/group' });
    }

    if (this.permissionService.hasPermission('user:view')) {
      this.menuItems.push({ label: 'Perfil', icon: 'pi pi-user', routerLink: '/user' });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
