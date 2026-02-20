import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ButtonModule, DividerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login { }