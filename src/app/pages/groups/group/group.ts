import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '../../../layout/main-layout/main-layout';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HasPermission } from '../../../core/directives/permission/has-permission';
import { UsersService } from '../../../core/services/users/users';
import { GroupService } from '../../../core/services/group/group';
import { Router } from '@angular/router';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    CommonModule,
    MainLayout,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    AutoCompleteModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    HasPermission,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './group.html',
  styleUrl: './group.scss',
})
export class Group implements OnInit {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private UsersService = inject(UsersService);
  private groupService = inject(GroupService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  groups: any[] = [];
  grupoDialog: boolean = false;
  isEditMode: boolean = false;

  grupoForm: FormGroup = this.fb.group({
    id: [null],
    nivel: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
  });

  niveles = ['Básico', 'Intermedio', 'Avanzado'];
  filteredNiveles: any[] = [];

  isLoading = true;
  isSaving = false;

  selectedGroupId: string | null = null;
  totalRecords = 0;

  isLoadingGlobal: boolean = true;

  searchNivel(event: any) {
    const query = event.query.toLowerCase();
    this.filteredNiveles = this.niveles.filter((n) => n.toLowerCase().includes(query));
  }

  ngOnInit() {
    this.isLoadingGlobal = true;
    setTimeout(() => {
      this.isLoadingGlobal = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  // ----- Cargar Grupos desde el Backend -----
  loadGroups(event?: TableLazyLoadEvent) {
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

    this.groupService.getGroups(page, limit, search).subscribe({
      next: (res) => {
        if (res.data && res.data[0]) {
          const payload = res.data[0];
          this.groups = Array.isArray(payload.groups)
            ? payload.groups
            : Array.isArray(payload)
              ? payload
              : [];
          this.totalRecords = payload.totalRecords || this.groups.length;
        } else {
          this.groups = [];
          this.totalRecords = 0;
        }
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.groups = [];
        this.totalRecords = 0;
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ----- Crear Grupo -----
  saveGrupo() {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      return;
    }

    if (!this.niveles.includes(this.grupoForm.value.nivel)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nivel ingresado no es válido.',
      });
      return;
    }

    this.isSaving = true;
    const { nombre, descripcion, nivel } = this.grupoForm.value;

    if (this.isEditMode && this.selectedGroupId) {
      this.groupService
        .updateGroup(this.selectedGroupId, { nombre, descripcion, nivel })
        .subscribe({
          next: (res) => {
            this.isSaving = false;
            this.grupoDialog = false;

            this.messageService.add({
              severity: 'success',
              summary: 'Grupo Actualizado',
              detail: res.data[0].message || 'Los cambios se guardaron exitosamente.',
            });

            this.loadGroups();
          },
          error: (err) => {
            this.isSaving = false;
          },
        });
    } else {
      this.groupService.createGroup({ nombre, descripcion, nivel }).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.grupoDialog = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Grupo Creado',
            detail: res.data[0].message || 'El grupo se creó exitosamente.',
          });

          this.loadGroups();
        },
        error: (err) => {
          this.isSaving = false;
        },
      });
    }
  }

  // ----- Editar Grupo -----
  editGroup(group: any) {
    this.isEditMode = true;
    this.selectedGroupId = group.id;

    this.grupoForm.patchValue({
      nombre: group.nombre,
      descripcion: group.descripcion,
      nivel: group.nivel,
    });

    this.grupoDialog = true;
  }

  // ----- Eliminar Grupo -----
  deleteGroup(group: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar el grupo <b>"${group.nombre}"</b>? Esta acción es irreversible.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isLoading = true;

        this.groupService.deleteGroup(group.id).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Grupo Eliminado',
              detail: res.data[0].message || 'El grupo se eliminó correctamente.',
            });

            this.loadGroups();
          },
          error: (err) => {
            this.isLoading = false;
          },
        });
      },
    });
  }

  // ----- Abrir Modal -----
  openNew() {
    this.isEditMode = false;
    this.grupoForm.reset({
      nivel: 'Básico',
    });
    this.grupoDialog = true;
  }

  // ----- Cerrar Modal -----
  hideDialog() {
    this.grupoDialog = false;
  }

  // ----- Navegar a Detalle del Grupo -----
  manageGroup(groupId: any) {
    this.router.navigate(['/group', groupId]);
  }

  get f() {
    return this.grupoForm.controls;
  }
}
