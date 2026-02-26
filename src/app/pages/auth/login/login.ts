import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth';

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
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  // Formulario
  loginForm: FormGroup = this.fb.group({
    usuario: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { usuario, password } = this.loginForm.value;

      // Verifica las credenciales
      const isValid = this.authService.login(usuario, password);

      if (isValid) {
        this.messageService.add({
          severity: 'success',
          summary: 'Acceso Concedido',
          detail: 'Redirigiendo al panel de control...',
        });

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Acceso Denegado',
          detail: 'Usuario o contraseña incorrectos.',
        });
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  get f() {
    return this.loginForm.controls;
  }
}
