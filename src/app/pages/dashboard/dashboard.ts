import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Obtenemos los datos del usuario logueado
  user = this.authService.getCurrentUser();

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}