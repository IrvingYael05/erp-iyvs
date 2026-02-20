import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ButtonModule, DividerModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register{ }