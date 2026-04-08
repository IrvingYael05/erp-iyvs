import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { UsersService } from '../../core/services/users/users';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, Sidebar, ToolbarModule, AvatarModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  @Input() pageTitle: string = 'Panel de Control';
  
  private UsersService = inject(UsersService);
  user = this.UsersService.getCurrentUser();
}