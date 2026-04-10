import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '../../layout/main-layout/main-layout';
import { UsersService } from '../../core/services/users/users';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
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
import { TableLazyLoadEvent } from 'primeng/table';

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
  private usersService = inject(UsersService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  users: any[] = [];

  permissionsDialog: boolean = false;
  userDialog: boolean = false;

  selectedUser: any = null;
  selectedPermissions: string[] = [];

  userForm: FormGroup = this.fb.group({
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

  isLoading = true;
  isSaving = false;

  totalRecords = 0;

  modules = [
    { key: 'user', label: 'Perfil Usuario' },
    { key: 'group', label: 'Grupos' },
    { key: 'group-detail', label: 'Gestión Grupo' },
    { key: 'user-manage', label: 'Gestión Usuarios' },
  ];

  actions = [
    { key: 'view', label: 'Ver' },
    { key: 'add', label: 'Agregar' },
    { key: 'edit', label: 'Editar' },
    { key: 'delete', label: 'Eliminar' },
  ];

  isLoadingGlobal: boolean = true;

  ngOnInit() {
    this.isLoadingGlobal = true;
    setTimeout(() => {
      this.isLoadingGlobal = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  loadUsers(event?: TableLazyLoadEvent) {
    this.isLoading = true;

    let page = 1;
    let limit = 5;
    let search = '';

    if (event) {
      limit = event.rows || 5;
      page = (event.first || 0) / limit + 1;

      if (event.globalFilter) {
        search = event.globalFilter as string;
      }
    }

    this.usersService.getUsers(page, limit, search).subscribe({
      next: (res) => {
        if (res.data && res.data[0]) {
          const payload = res.data[0];
          this.users = Array.isArray(payload.users) ? payload.users : [];
          this.totalRecords = payload.totalRecords || this.users.length;
        } else {
          this.users = [];
          this.totalRecords = 0;
        }
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.users = [];
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
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

    if (this.userForm.valid) {
      this.isSaving = true;

      this.usersService.createUser(this.userForm.value).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.userDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Usuario Creado',
            detail: res.data[0].message || 'Usuario registrado correctamente.',
          });

          this.loadUsers({ first: 0, rows: 5 });
        },
        error: (err) => {
          this.isSaving = false;
        },
      });
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  deleteUser(user: any) {
    if (user.email === this.usersService.getCurrentUser()?.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acción Denegada',
        detail: 'No puedes suspender tu propia cuenta.',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas suspender el acceso a ${user.nombreCompleto}?`,
      header: 'Confirmar Suspensión',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Suspender',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isLoading = true;
        this.usersService.deleteUser(user.id).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'warn',
              summary: 'Usuario Suspendido',
              detail: res.data[0].message || 'El acceso ha sido revocado.',
            });
            this.loadUsers();
          },
          error: (err) => {
            this.isLoading = false;
          },
        });
      },
    });
  }

  openPermissions(user: any) {
    if (user.email === this.usersService.getCurrentUser()?.email) {
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
    if (!this.selectedUser) return;

    if (this.selectedUser.email === this.usersService.getCurrentUser()?.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acción Denegada',
        detail: 'No puedes editar tu propia cuenta.',
      });
      return;
    }

    this.isSaving = true;

    this.usersService.updatePermissions(this.selectedUser.id, this.selectedPermissions).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.permissionsDialog = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Permisos Actualizados',
          detail: res.data[0].message || 'Los cambios se guardaron exitosamente.',
        });

        this.loadUsers();
      },
      error: (err) => {
        this.isSaving = false;
      },
    });
  }

  get uf() {
    return this.userForm.controls;
  }
}
