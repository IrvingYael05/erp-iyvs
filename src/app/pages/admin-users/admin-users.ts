import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '../../layout/main-layout/main-layout';
import { AuthService } from '../../core/services/auth/auth';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { HasPermission } from '../../core/directives/permission/has-permission';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MainLayout,
    TableModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    InputTextModule,
    PasswordModule,
    HasPermission,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-users.html',
})
export class AdminUsers implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  users: any[] = [];

  permissionsDialog: boolean = false;
  userDialog: boolean = false;

  selectedUser: any = null;
  selectedPermissions: string[] = [];

  userForm: FormGroup = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.email]],
    nombreCompleto: ['', [Validators.required, Validators.minLength(5)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern('^.*[@$!%*?&#/\\-+=<>].*$'),
      ],
    ],
  });

  modules = [
    { key: 'group', label: 'Grupos' },
    { key: 'group-detail', label: 'Gestión Grupo' },
    { key: 'user', label: 'Perfil Usuario' },
    { key: 'user-manage', label: 'Gestión Usuarios' },
  ];

  actions = [
    { key: 'view', label: 'Ver' },
    { key: 'add', label: 'Agregar' },
    { key: 'edit', label: 'Editar' },
    { key: 'delete', label: 'Eliminar' },
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.users = this.authService.getAllUsers();
  }

  isSuperAdmin(user: any): boolean {
    return user.permissions?.some((p: string) => p.startsWith('user-manage:'));
  }

  openNewUser() {
    this.userForm.reset();
    this.userDialog = true;
  }

  saveNewUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const newUser = this.userForm.value;

    if (this.authService.userExists(newUser.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El correo electrónico ya está registrado.',
      });
      return;
    }
    if (this.users.some((u) => u.usuario.toLowerCase() === newUser.usuario.toLowerCase())) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre de usuario ya está en uso.',
      });
      return;
    }

    this.authService.addUser(newUser);
    this.loadUsers();
    this.userDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario creado correctamente',
    });
  }

  deleteUser(user: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar permanentemente al usuario ${user.usuario}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (this.authService.getCurrentUser()?.usuario === user.usuario) {
          this.messageService.add({
            severity: 'error',
            summary: 'Acción Denegada',
            detail: 'No puedes eliminar tu propia cuenta desde aquí.',
          });
          return;
        }
        this.authService.deleteUser(user.usuario);
        this.loadUsers();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario eliminado',
        });
      },
    });
  }

  openPermissions(user: any) {
    if (user.usuario === this.authService.getCurrentUser()?.usuario) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acción Denegada',
        detail: 'No puedes editar tu propia cuenta.',
      });
      return;
    }
    this.selectedUser = user;
    this.selectedPermissions = [...(user.permissions || [])];
    this.permissionsDialog = true;
  }

  onPermissionChange(event: any, modKey: string, actKey: string) {
    const isChecked = event.checked;

    if (isChecked && actKey !== 'view') {
      const viewPerm = `${modKey}:view`;
      if (!this.selectedPermissions.includes(viewPerm)) {
        this.selectedPermissions = [...this.selectedPermissions, viewPerm];
      }
    } else if (actKey === 'view') {
      this.selectedPermissions = this.selectedPermissions.filter(
        (p) => p !== `${modKey}:add` && p !== `${modKey}:edit` && p !== `${modKey}:delete`,
      );
    }
  }

  savePermissions() {
    if (this.selectedUser.usuario === this.authService.getCurrentUser()?.usuario) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acción Denegada',
        detail: 'No puedes editar tu propia cuenta.',
      });
      return;
    }

    if (this.selectedUser) {
      const updatedUser = { ...this.selectedUser, permissions: this.selectedPermissions };

      this.authService.updateUser(updatedUser);
      this.loadUsers();
      this.permissionsDialog = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Permisos actualizados correctamente',
      });
    }
  }

  get uf() {
    return this.userForm.controls;
  }
}
