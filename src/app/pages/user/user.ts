import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '../../layout/main-layout/main-layout';
import { AuthService } from '../../core/services/auth';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, MainLayout, CardModule, AvatarModule, DividerModule],
  templateUrl: './user.html',
  styleUrl: './user.scss'
})
export class User {
  private authService = inject(AuthService);
  
  userData = this.authService.getCurrentUser();
}