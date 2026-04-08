import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Toast } from 'primeng/toast';
import { UsersService } from './core/services/users/users';
import { OnInit, inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnInit {
  private UsersService = inject(UsersService);
  private router = inject(Router);

  ngOnInit() {
    if (this.UsersService.isLoggedIn()) {
      this.UsersService.fetchCurrentUser().subscribe({
        error: (err) => {
          this.UsersService.logout().subscribe({
            next: (response) => {
              this.router.navigate(['/login']);
            },
            error: (err) => {
              location.reload();
            },
          });
        },
      });
    }
  }
}
