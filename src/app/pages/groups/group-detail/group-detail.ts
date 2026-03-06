import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayout } from '../../../layout/main-layout/main-layout';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HasPermission } from '../../../core/directives/permission/has-permission';
import { GroupService } from '../../../core/services/group/group';
import { AuthService } from '../../../core/services/auth/auth';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { DragDropModule } from 'primeng/dragdrop';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    MainLayout,
    ReactiveFormsModule,
    TabsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    HasPermission,
    DialogModule,
    AutoCompleteModule,
    TextareaModule,
    DatePickerModule,
    TagModule,
    DragDropModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './group-detail.html',
  styleUrl: './group-detail.scss',
})
export class GroupDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private groupService = inject(GroupService);
  private authService = inject(AuthService);

  grupoId: number | null = null;
  grupo: any = null;

  integranteForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  vistaTickets: 'tabla' | 'kanban' = 'tabla';
  ticketDialog: boolean = false;
  isEditTicketMode: boolean = false;

  estados = ['Pendiente', 'En Progreso', 'Revisión', 'Finalizado'];
  prioridades = ['Baja', 'Media', 'Alta'];

  filteredIntegrantes: string[] = [];
  filteredEstados: string[] = [];
  filteredPrioridades: string[] = [];

  minDate: Date = new Date();
  draggedTicket: any | null = null;

  ticketForm: FormGroup = this.fb.group({
    id: [null],
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    estado: ['Pendiente', Validators.required],
    asignadoA: ['', Validators.required],
    prioridad: ['Media', Validators.required],
    fechaLimite: [null, Validators.required],
    comentarios: [''],
    fechaCreacion: [null],
    historial: [[]],
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.grupoId = +idParam;
        this.loadGroup();
      } else {
        this.volverDirectorio();
      }
    });
  }

  loadGroup() {
    this.grupo = this.groupService.getGroupById(this.grupoId!);
    if (!this.grupo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Grupo no encontrado',
      });
      this.volverDirectorio();
    }
  }

  volverDirectorio() {
    this.router.navigate(['/group']);
  }

  // --- INTEGRANTES ---

  agregarIntegrante() {
    if (this.integranteForm.invalid) return;
    const emailNuevo = this.integranteForm.value.email.toLowerCase().trim();

    if (!this.authService.userExists(emailNuevo)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No existe un usuario con este correo en el sistema.',
      });
      return;
    }

    if (this.grupo.integrantesList?.includes(emailNuevo)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Este usuario ya es integrante del grupo.',
      });
      return;
    }

    this.groupService.addMember(this.grupoId!, emailNuevo);
    this.loadGroup();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Integrante agregado correctamente.',
    });
    this.integranteForm.reset();
  }

  eliminarIntegrante(email: string) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar a ${email} del grupo?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const currentUserEmail = this.authService.getCurrentUser()?.email;
        if (currentUserEmail === email) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No puedes eliminarte a ti mismo del grupo.',
          });
          return;
        }

        this.groupService.removeMember(this.grupoId!, email);
        this.loadGroup();

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Integrante removido del grupo',
        });
      },
    });
  }

  // --- TICKETS ---

  cambiarVista(vista: 'tabla' | 'kanban') {
    this.vistaTickets = vista;
  }

  getTicketsPorEstado(estado: string) {
    if (!this.grupo || !this.grupo.ticketsList) return [];
    return this.grupo.ticketsList.filter((t: any) => t.estado === estado);
  }

  dragStart(ticket: any) {
    this.draggedTicket = ticket;
  }

  dragEnd() {
    this.draggedTicket = null;
  }

  drop(estadoDestino: string) {
    if (this.draggedTicket && this.draggedTicket.estado !== estadoDestino) {
      const currentUser = this.authService.getCurrentUser()?.nombreCompleto || 'Usuario';
      const fechaActual = new Date().toLocaleString();

      const index = this.grupo.ticketsList.findIndex((t: any) => t.id === this.draggedTicket.id);

      if (index !== -1) {
        const ticket = { ...this.grupo.ticketsList[index] };
        ticket.estado = estadoDestino;

        if (!ticket.historial) ticket.historial = [];
        ticket.historial.push(
          `${currentUser} movió el ticket a '${estadoDestino}' el ${fechaActual}`,
        );

        this.groupService.updateTicket(this.grupoId!, ticket);
        this.loadGroup();

        this.messageService.add({
          severity: 'info',
          summary: 'Ticket Actualizado',
          detail: `Movido a ${estadoDestino}`,
        });
      }
    }
    this.draggedTicket = null;
  }

  buscarIntegrante(event: any) {
    const query = event.query.toLowerCase();
    const integrantes = this.grupo?.integrantesList || [];
    this.filteredIntegrantes = integrantes.filter((email: string) =>
      email.toLowerCase().includes(query),
    );
  }

  buscarEstado(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEstados = this.estados.filter((e) => e.toLowerCase().includes(query));
  }

  buscarPrioridad(event: any) {
    const query = event.query.toLowerCase();
    this.filteredPrioridades = this.prioridades.filter((p) => p.toLowerCase().includes(query));
  }

  abrirNuevoTicket() {
    this.isEditTicketMode = false;
    this.ticketForm.reset({ estado: 'Pendiente', prioridad: 'Media', historial: [] });
    this.ticketDialog = true;
  }

  editarTicket(ticket: any) {
    this.isEditTicketMode = true;
    const ticketParsed = {
      ...ticket,
      fechaLimite: ticket.fechaLimite ? new Date(ticket.fechaLimite) : null,
    };
    this.ticketForm.patchValue(ticketParsed);
    this.ticketDialog = true;
  }

  eliminarTicket(ticket: any) {
    this.confirmationService.confirm({
      message: `¿Eliminar el ticket "${ticket.titulo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.groupService.deleteTicket(this.grupoId!, ticket.id);
        this.loadGroup();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Ticket eliminado',
        });
      },
    });
  }

  guardarTicket() {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const formValue = this.ticketForm.value;
    const currentUser = this.authService.getCurrentUser()?.nombreCompleto || 'Usuario';
    const fechaActual = new Date().toLocaleString();

    if (
      formValue.fechaLimite &&
      formValue.fechaLimite < new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha límite no puede ser anterior a la actual',
        life: 3000,
      });
      return;
    }
    if (!this.estados.includes(formValue.estado)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El estado ingresado no es válido',
        life: 3000,
      });
      return;
    }
    if (!this.prioridades.includes(formValue.prioridad)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La prioridad ingresada no es válida',
        life: 3000,
      });
      return;
    }
    if (!this.grupo.integrantesList.includes(formValue.asignadoA)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El usuario asignado no pertenece al grupo',
        life: 3000,
      });
      return;
    }

    if (this.isEditTicketMode) {
      const index = this.grupo.ticketsList.findIndex((t: any) => t.id === formValue.id);
      const ticketAnterior = this.grupo.ticketsList[index];

      let historial = [...(ticketAnterior.historial || [])];
      let cambios = [];

      if (ticketAnterior.estado !== formValue.estado)
        cambios.push(`cambió el estado a '${formValue.estado}'`);
      if (ticketAnterior.asignadoA !== formValue.asignadoA)
        cambios.push(`reasignó la tarea a '${formValue.asignadoA}'`);
      if (ticketAnterior.prioridad !== formValue.prioridad)
        cambios.push(`cambió la prioridad a '${formValue.prioridad}'`);

      if (cambios.length > 0)
        historial.push(`${currentUser} ${cambios.join(', ')} el ${fechaActual}`);

      formValue.historial = historial;

      this.groupService.updateTicket(this.grupoId!, formValue);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Ticket actualizado',
      });
    } else {
      formValue.fechaCreacion = new Date();
      formValue.historial = [`${currentUser} creó el ticket el ${fechaActual}`];

      this.groupService.addTicket(this.grupoId!, formValue);
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket creado' });
    }

    this.loadGroup();
    this.ticketDialog = false;
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

  get tf() {
    return this.ticketForm.controls;
  }
}
