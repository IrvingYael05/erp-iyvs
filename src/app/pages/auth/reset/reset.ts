import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UsersService } from '../../../core/services/users/users';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { Divider } from 'primeng/divider';

// Validador para confirmar las contraseñas
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [ReactiveFormsModule, ToastModule, ButtonModule, PasswordModule, Divider],
  providers: [MessageService],
  templateUrl: './reset.html',
  styleUrl: './reset.scss',
})
export class ResetPassword implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private UsersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  isLoading = false;
  recoveryToken: string | null = null;

  resetForm: FormGroup = this.fb.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.pattern('^.*[@$!%*?&#/\\-+=<>].*$'),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        this.recoveryToken = params.get('access_token');
      }
    });

    if (!this.recoveryToken) {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit() {
    if (this.resetForm.valid && this.recoveryToken) {
      this.isLoading = true;
      const { newPassword } = this.resetForm.value;

      this.UsersService.resetPassword(newPassword, this.recoveryToken).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: res.data[0].message,
          });
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        },
        error: () => (this.isLoading = false),
      });
    }
  }

  get f() {
    return this.resetForm.controls;
  }
}
