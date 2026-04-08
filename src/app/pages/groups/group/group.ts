import { Component, inject, OnInit } from '@angular/core';
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

  grupos: any[] = [];
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

  searchNivel(event: any) {
    const query = event.query.toLowerCase();
    this.filteredNiveles = this.niveles.filter((n) => n.toLowerCase().includes(query));
  }

  ngOnInit() {
    this.cargarGrupos();
  }

  cargarGrupos() {
    this.grupos = this.groupService.getGroups();
  }

  openNew() {
    this.isEditMode = false;
    this.grupoForm.reset();
    this.grupoDialog = true;
  }

  editGrupo(grupo: any) {
    this.isEditMode = true;
    this.grupoForm.patchValue(grupo);
    this.grupoDialog = true;
  }

  manageGroup(grupo: any) {
    this.router.navigate(['/group', grupo.id]);
  }

  deleteGrupo(grupo: any) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar el grupo "' + grupo.nombre + '"?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.groupService.deleteGroup(grupo.id);
        this.cargarGrupos();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Grupo eliminado correctamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.grupoDialog = false;
  }

  saveGrupo() {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      return;
    }

    if (this.grupoForm.value.nivel != this.niveles.find((n) => n === this.grupoForm.value.nivel)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nivel ingresado no es válido',
        life: 3000,
      });
      return;
    }

    const formValue = this.grupoForm.value;
    const currentUser = this.UsersService.getCurrentUser();

    if (this.isEditMode) {
      const originalGroup = this.groupService.getGroupById(formValue.id);
      const updatedGroup = { ...originalGroup, ...formValue };

      this.groupService.updateGroup(updatedGroup);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Grupo actualizado correctamente',
        life: 3000,
      });
    } else {
      formValue.autor = currentUser.nombreCompleto;
      formValue.integrantesList = [currentUser.email];
      formValue.ticketsList = [];

      this.groupService.createGroup(formValue);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Grupo creado correctamente',
        life: 3000,
      });
    }

    this.cargarGrupos();
    this.grupoDialog = false;
  }

  get f() {
    return this.grupoForm.controls;
  }
}