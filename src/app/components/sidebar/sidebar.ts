import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { UsersService } from '../../core/services/users/users';
import { Permission } from '../../core/services/permission/permission';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, ButtonModule, PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private UsersService = inject(UsersService);
  private permissionService = inject(Permission);
  private router = inject(Router);
  private messageService = inject(MessageService);

  isLoading = false;
  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.UsersService.currentUser$.subscribe(() => {
      this.buildMenu();
    });
  }

  buildMenu() {
    this.menuItems = [{ label: 'Inicio', icon: 'pi pi-home', routerLink: '/home' }];

    if (this.permissionService.hasPermission('group:view')) {
      this.menuItems.push({
        label: 'Gestión de Grupos',
        icon: 'pi pi-users',
        routerLink: '/group',
      });
    }

    if (this.permissionService.hasPermission('user-manage:view')) {
      this.menuItems.push({
        label: 'Gestión de Usuarios',
        icon: 'pi pi-shield',
        routerLink: '/admin/users',
      });
    }

    if (this.permissionService.hasPermission('user:view')) {
      this.menuItems.push({ label: 'Perfil', icon: 'pi pi-user', routerLink: '/user' });
    }
  }

  logout() {
    this.isLoading = true;
    this.UsersService.logout().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sesión Cerrada',
          detail: response.data && response.data[0] ? response.data[0].message : 'Redirigiendo...',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }
}
