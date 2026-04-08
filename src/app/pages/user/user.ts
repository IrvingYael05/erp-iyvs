import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '../../layout/main-layout/main-layout';
import { UsersService } from '../../core/services/users/users';
import { GroupService } from '../../core/services/group/group';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
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
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';

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

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
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
    TableModule,
    TagModule,
    PasswordModule,
    DialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User implements OnInit {
  private UsersService = inject(UsersService);
  private groupService = inject(GroupService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  userData = this.UsersService.getCurrentUser();
  profileForm!: FormGroup;

  minDate: Date = new Date();

  misTickets: any[] = [];
  misEstadisticas: any = {};

  passwordDialog: boolean = false;
  passwordForm!: FormGroup;

  isProfileLoading = false;
  isPasswordLoading = false;
  isDeleteLoading = false;

  ngOnInit() {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      nombreCompleto: ['', [Validators.required, Validators.minLength(5)]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      fechaNacimiento: [null, [Validators.required, ageValidator]],
    });

    this.UsersService.currentUser$.subscribe((user) => {
      if (user) {
        this.userData = user;

        this.profileForm.patchValue({
          email: user.email,
          nombreCompleto: user.nombreCompleto,
          direccion: user.direccion,
          telefono: user.telefono,
          fechaNacimiento: user.fechaNacimiento ? new Date(user.fechaNacimiento) : null,
        });
      }
    });

    this.cargarDatosLaborales();

    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.pattern('^.*[@$!%*?&#/\\-+=<>].*$'),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
    );
  }

  abrirModalPassword() {
    this.passwordForm.reset();
    this.passwordDialog = true;
  }

  cambiarPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isPasswordLoading = true;
    const { oldPassword, newPassword } = this.passwordForm.value;

    this.UsersService.changePassword(oldPassword, newPassword).subscribe({
      next: (res) => {
        this.isPasswordLoading = false;
        this.passwordDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Seguridad',
          detail: res.data[0].message,
        });
      },
      error: (err) => {
        this.isPasswordLoading = false;
        this.passwordForm.get('oldPassword')?.reset();
      },
    });
  }

  get pf() {
    return this.passwordForm.controls;
  }

  cargarDatosLaborales() {
    if (this.userData?.email) {
      this.misTickets = this.groupService.getUserTickets(this.userData.email);
      this.misEstadisticas = this.groupService.getUserTicketStats(this.userData.email);
    }
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      this.isProfileLoading = true;

      const { nombreCompleto, direccion, telefono, fechaNacimiento } =
        this.profileForm.getRawValue();

      this.UsersService
        .updateProfile({ nombreCompleto, direccion, telefono, fechaNacimiento })
        .subscribe({
          next: (res) => {
            this.isProfileLoading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Perfil Actualizado',
              detail: res.data[0].message || 'Tus datos han sido actualizados.',
            });
            this.profileForm.markAsPristine();
          },
          error: (err) => {
            this.isProfileLoading = false;
          },
        });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  deactivateAccount() {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar definitivamente',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isDeleteLoading = true;
        this.UsersService.deleteAccount().subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Cuenta Eliminada',
              detail: res.data[0].message,
            });
            this.isDeleteLoading = false;
            setTimeout(() => this.router.navigate(['/auth/login']), 2000);
          },
          error: (err) => {
            this.isDeleteLoading = false;
          },
        });
      },
    });
  }

  irAlGrupo(grupoId: number) {
    this.router.navigate(['/group', grupoId]);
  }

  getSeverityPorEstado(estado: string): any {
    switch (estado) {
      case 'Pendiente':
        return 'secondary';
      case 'En Progreso':
        return 'info';
      case 'Revisión':
        return 'warn';
      case 'Finalizado':
        return 'success';
      default:
        return 'info';
    }
  }

  getSeverityPorPrioridad(prioridad: string): any {
    switch (prioridad) {
      case 'Baja':
        return 'success';
      case 'Media':
        return 'warn';
      case 'Alta':
        return 'danger';
      default:
        return 'info';
    }
  }

  get f() {
    return this.profileForm.controls;
  }
}
