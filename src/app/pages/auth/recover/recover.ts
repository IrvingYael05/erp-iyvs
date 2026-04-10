import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../../core/services/users/users';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    ToastModule,
    CardModule,
    Divider,
    CommonModule,
  ],
  providers: [MessageService],
  templateUrl: './recover.html',
})
export class Recover {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private UsersService = inject(UsersService);
  private router = inject(Router);

  isLoading = false;

  recoverForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  emailSent: boolean = false;

  onSubmit() {
    if (this.recoverForm.valid) {
      this.isLoading = true;
      const { email } = this.recoverForm.value;

      this.UsersService.recoverPassword(email).subscribe({
        next: (res) => {
          this.isLoading = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Solicitud Recibida',
            detail: res.data[0].message || 'Si el correo existe, recibirás instrucciones.',
          });

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
    } else {
      this.recoverForm.markAllAsTouched();
    }
  }

  get f() {
    return this.recoverForm.controls;
  }
}
