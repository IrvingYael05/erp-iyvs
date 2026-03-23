import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth/auth';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    ToastModule,
    CardModule,
    Divider,
  ],
  providers: [MessageService],
  templateUrl: './recover.html',
})
export class Recover {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  recoverForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  emailSent: boolean = false;

  onSubmit() {
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    const email = this.recoverForm.value.email;

    if (this.authService.userExists(email)) {
      // Futuro código Supabase: await supabase.auth.resetPasswordForEmail(email)
      this.emailSent = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Correo enviado',
        detail: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No existe ninguna cuenta asociada a este correo.',
      });
    }
  }

  get f() {
    return this.recoverForm.controls;
  }
}
