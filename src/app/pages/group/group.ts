import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '../../layout/main-layout/main-layout';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HasPermission } from '../../core/directives/permission/has-permission';

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
    InputNumberModule,
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

  grupos: any[] = [];

  grupoDialog: boolean = false;
  isEditMode: boolean = false;

  grupoForm: FormGroup = this.fb.group({
    id: [null],
    nivel: ['', Validators.required],
    autor: ['', Validators.required],
    nombre: ['', Validators.required],
    integrantes: [1, [Validators.required, Validators.min(1)]],
    tickets: [0, [Validators.required, Validators.min(0)]],
    descripcion: [''],
  });

  niveles = ['Básico', 'Intermedio', 'Avanzado'];
  filteredNiveles: any[] = [];

  searchNivel(event: any) {
    const query = event.query.toLowerCase();
    this.filteredNiveles = this.niveles.filter((n) => n.toLowerCase().includes(query));
  }

  ngOnInit() {
    const storedGrupos = localStorage.getItem('erp_grupos');
    if (storedGrupos) {
      this.grupos = JSON.parse(storedGrupos);
    } else {
      this.grupos = [
        {
          id: 1,
          nivel: 'Avanzado',
          autor: 'Admin',
          nombre: 'Desarrollo Frontend',
          integrantes: 5,
          tickets: 12,
          descripcion: 'Equipo encargado de Angular',
        },
      ];
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem('erp_grupos', JSON.stringify(this.grupos));
  }

  openNew() {
    this.isEditMode = false;
    this.grupoForm.reset({ integrantes: 1, tickets: 0 });
    this.grupoDialog = true;
  }

  editGrupo(grupo: any) {
    this.isEditMode = true;
    this.grupoForm.patchValue(grupo);
    this.grupoDialog = true;
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
        this.grupos = this.grupos.filter((val) => val.id !== grupo.id);
        this.saveToStorage();
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

    const formValue = this.grupoForm.value;

    if (this.isEditMode) {
      const index = this.grupos.findIndex((g) => g.id === formValue.id);
      this.grupos[index] = formValue;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Grupo actualizado',
        life: 3000,
      });
    } else {
      formValue.id = this.grupos.length > 0 ? Math.max(...this.grupos.map((g) => g.id)) + 1 : 1;
      this.grupos.push(formValue);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Grupo creado',
        life: 3000,
      });
    }

    this.grupos = [...this.grupos];
    this.saveToStorage();
    this.grupoDialog = false;
    this.grupoDialog = false;
  }

  get f() {
    return this.grupoForm.controls;
  }
}
