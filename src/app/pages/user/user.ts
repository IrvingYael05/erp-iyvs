import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '../../layout/main-layout/main-layout';
import { AuthService } from '../../core/services/auth/auth';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { HasPermission } from '../../core/directives/permission/has-permission';

function ageValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  const birthDate = new Date(control.value);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18 ? null : { minor: true };
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    MainLayout,
    CardModule,
    AvatarModule,
    DividerModule,
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    HasPermission,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  userData = this.authService.getCurrentUser();
  profileForm!: FormGroup;

  ngOnInit() {
    this.profileForm = this.fb.group({
      usuario: [{ value: this.userData?.usuario, disabled: true }],
      email: [{ value: this.userData?.email, disabled: true }],
      nombreCompleto: [
        this.userData?.nombreCompleto,
        [Validators.required, Validators.minLength(5)],
      ],
      direccion: [this.userData?.direccion, [Validators.required]],
      telefono: [this.userData?.telefono, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      fechaNacimiento: [
        this.userData?.fechaNacimiento ? new Date(this.userData.fechaNacimiento) : null,
        [Validators.required, ageValidator],
      ],
    });
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      const updatedData = { ...this.userData, ...this.profileForm.getRawValue() };

      this.authService.updateUser(updatedData);
      this.userData = this.authService.getCurrentUser();

      this.messageService.add({
        severity: 'success',
        summary: 'Perfil Actualizado',
        detail: 'Tus datos se guardaron correctamente en el sistema.',
      });

      this.profileForm.markAsPristine();
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  deactivateAccount() {
    this.confirmationService.confirm({
      message:
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción restringirá tu acceso al sistema.',
      header: 'Eliminar Cuenta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cuenta Eliminada',
          detail: 'Cerrando sesión y eliminando datos...',
        });

        setTimeout(() => {
          this.authService.deleteUser(this.userData.usuario);
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
    });
  }

  get f() {
    return this.profileForm.controls;
  }
}
