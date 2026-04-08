import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../../core/services/users/users';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    DividerModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private UsersService = inject(UsersService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  isLoading = false;

  loginForm: FormGroup = this.fb.group({
    usuario: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const { usuario, password } = this.loginForm.value;

      this.UsersService.login(usuario, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Acceso Concedido',
            detail: response.data[0].message || 'Redirigiendo...',
          });

          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading = false;
          this.loginForm.get('password')?.reset();
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  get f() {
    return this.loginForm.controls;
  }
}
