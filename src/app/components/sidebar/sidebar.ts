import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth'; 
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
    { label: 'Grupo', icon: 'pi pi-users', routerLink: '/group' },
    { label: 'Perfil', icon: 'pi pi-user', routerLink: '/user' }
  ];

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}