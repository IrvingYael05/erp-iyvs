import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { UsersService } from '../../core/services/users/users';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, Sidebar, ToolbarModule, AvatarModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit, OnDestroy {
  @Input() pageTitle: string = 'Panel de Control';

  private usersService = inject(UsersService);
  user: any = null;
  private userSub!: Subscription;

  ngOnInit() {
    this.userSub = this.usersService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
