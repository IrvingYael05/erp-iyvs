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
import { Permission } from '../../../core/services/permission/permission';
import { GroupService } from '../../../core/services/group/group';
import { AuthService } from '../../../core/services/auth/auth';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { DragDropModule } from 'primeng/dragdrop';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

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
    CardModule,
    FormsModule,
    CheckboxModule,
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
  private permissionService = inject(Permission);

  grupoId: number | null = null;
  grupo: any = null;

  activeTab: string = '0';
  activeTicketTab: string = '0';

  integranteForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  vistaTickets: 'tabla' | 'kanban' = 'tabla';
  ticketDialog: boolean = false;
  isEditTicketMode: boolean = false;
  canEditTicket: boolean = true;

  filtroActual: 'todos' | 'mis_tickets' | 'sin_asignar' | 'prioridad_alta' = 'todos';

  estados = ['Pendiente', 'En Progreso', 'Revisión', 'Finalizado'];
  prioridades = ['Baja', 'Media', 'Alta'];

  filteredIntegrantes: string[] = [];
  filteredEstados: string[] = [];
  filteredPrioridades: string[] = [];
  ticketsList: any[] = [];
  integrantesObjList: any[] = [];

  groupStats: any = {};
  recentOrAssignedTickets: any[] = [];

  minDate: Date = new Date();
  draggedTicket: any | null = null;

  currentTicket: any = null;

  ticketForm: FormGroup = this.fb.group({
    id: [null],
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    estado: ['Pendiente', Validators.required],
    asignadoA: [''],
    prioridad: ['Media', Validators.required],
    fechaLimite: [null, Validators.required],
    nuevoComentario: [''],
    fechaCreacion: [null],
    historial: [[]],
    autorEmail: [null],
  });

  permissionsDialog: boolean = false;
  selectedMemberEmail: string = '';
  selectedMemberPermissions: string[] = [];
  ticketPermissions = [
    { key: 'ticket:view', label: 'Ver Tickets' },
    { key: 'ticket:add', label: 'Crear Tickets' },
    { key: 'ticket:edit', label: 'Editar Tickets' },
    { key: 'ticket:delete', label: 'Eliminar Tickets' },
  ];

  get currentUserEmail(): string {
    return this.authService.getCurrentUser()?.email || '';
  }

  hasLocalPerm(action: string): boolean {
    if (!this.grupoId || !this.currentUserEmail) return false;
    return this.groupService.hasLocalPermission(
      this.grupoId,
      this.currentUserEmail,
      `ticket:${action}`,
    );
  }

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

    if (this.permissionService.hasPermission('group-detail:view')) {
      this.activeTab = '0';
    } else if (this.hasLocalPerm('view')) {
      this.activeTab = '1';
    }
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
    } else {
      this.aplicarFiltro(this.filtroActual);
      this.loadDashboardData();
      this.integrantesObjList = (this.grupo.integrantesList || []).map((email: string) => ({
        email,
      }));
    }
  }

  loadDashboardData() {
    this.groupStats = this.groupService.getGroupTicketStats(this.grupoId!);
    const currentUserEmail = this.authService.getCurrentUser()?.email;
    const misTickets = this.groupService.getGroupTicketsFiltered(
      this.grupoId!,
      'mis_tickets',
      currentUserEmail!,
    );

    if (misTickets.length > 0) {
      this.recentOrAssignedTickets = misTickets.slice(0, 5);
    } else {
      this.recentOrAssignedTickets = [...this.grupo.ticketsList].reverse().slice(0, 5);
    }
  }

  volverDirectorio() {
    this.router.navigate(['/group']);
  }

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

    this.abrirModalPermisos(emailNuevo);
  }

  abrirModalPermisos(email: string) {
    if (email === this.authService.getCurrentUser()?.usuario) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acción Denegada',
        detail: 'No puedes editar tu propia cuenta.',
      });
      return;
    }
    this.selectedMemberEmail = email;
    const group = this.groupService.getGroupById(this.grupoId!);
    this.selectedMemberPermissions =
      group.memberPermissions && group.memberPermissions[email]
        ? [...group.memberPermissions[email]]
        : [];
    this.permissionsDialog = true;
  }

  guardarPermisosLocales() {
    if (this.selectedMemberEmail === this.authService.getCurrentUser()?.usuario) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acción Denegada',
        detail: 'No puedes editar tu propia cuenta.',
      });
      return;
    }
    this.groupService.updateMemberPermissions(
      this.grupoId!,
      this.selectedMemberEmail,
      this.selectedMemberPermissions,
    );
    this.loadGroup();
    this.permissionsDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Permisos del integrante actualizados',
    });
  }

  onLocalPermissionChange(event: any, actKey: string) {
    const isChecked = event.checked;

    if (isChecked && actKey !== 'ticket:view') {
      if (!this.selectedMemberPermissions.includes('ticket:view')) {
        this.selectedMemberPermissions = [...this.selectedMemberPermissions, 'ticket:view'];
      }
    } else if (actKey === 'ticket:view') {
      this.selectedMemberPermissions = [];
    }
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

  cambiarVista(vista: 'tabla' | 'kanban') {
    this.vistaTickets = vista;
  }

  aplicarFiltro(nuevoFiltro: 'todos' | 'mis_tickets' | 'sin_asignar' | 'prioridad_alta') {
    this.filtroActual = nuevoFiltro;
    const currentUserEmail = this.authService.getCurrentUser()?.email;
    this.ticketsList = this.groupService.getGroupTicketsFiltered(
      this.grupoId!,
      this.filtroActual,
      currentUserEmail!,
    );
  }

  getTicketsPorEstado(estado: string) {
    return this.ticketsList.filter((t: any) => t.estado === estado);
  }

  dragStart(ticket: any) {
    this.draggedTicket = ticket;
  }

  dragEnd() {
    this.draggedTicket = null;
  }

  drop(estadoDestino: string) {
    if (!this.hasLocalPerm('edit')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acceso Denegado',
        detail: 'No tienes permiso para editar el estado de los tickets.',
      });
      this.draggedTicket = null;
      return;
    }

    if (this.draggedTicket && this.draggedTicket.estado !== estadoDestino) {
      const currentUserEmail = this.authService.getCurrentUser()?.email;
      const currentUserNombre = this.authService.getCurrentUser()?.nombreCompleto || 'Usuario';

      if (
        this.draggedTicket.autorEmail &&
        this.draggedTicket.autorEmail !== currentUserEmail &&
        this.draggedTicket.asignadoA !== currentUserEmail
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Acceso Denegado',
          detail: 'No tienes permisos para mover este ticket.',
        });
        this.draggedTicket = null;
        return;
      }

      const index = this.grupo.ticketsList.findIndex((t: any) => t.id === this.draggedTicket.id);

      if (index !== -1) {
        const ticket = { ...this.grupo.ticketsList[index] };
        ticket.estado = estadoDestino;

        if (!ticket.historial) ticket.historial = [];
        ticket.historial.push({
          fecha: new Date(),
          descripcion: `${currentUserNombre} movió el ticket a '${estadoDestino}'`,
        });

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
    this.canEditTicket = true;
    this.ticketForm.enable();

    this.currentTicket = { historial: [], comentariosList: [] };

    this.ticketForm.reset({
      estado: 'Pendiente',
      prioridad: 'Media',
      historial: [],
      asignadoA: '',
      autorEmail: null,
      nuevoComentario: '',
    });
    this.ticketDialog = true;
  }

  editarTicket(ticket: any) {
    this.isEditTicketMode = true;
    this.canEditTicket = true;
    this.ticketForm.enable();

    this.currentTicket = { ...ticket };
    if (!this.currentTicket.comentariosList) this.currentTicket.comentariosList = [];

    const ticketParsed = {
      ...ticket,
      fechaLimite: ticket.fechaLimite ? new Date(ticket.fechaLimite) : null,
    };

    this.ticketForm.patchValue({
      ...ticketParsed,
      nuevoComentario: '',
    });

    const currentUserEmail = this.authService.getCurrentUser()?.email;
    const hasLocalEdit = this.hasLocalPerm('edit');

    if (!hasLocalEdit) {
      this.ticketForm.disable();
      this.canEditTicket = false;
    } else {
      if (ticket.autorEmail && ticket.autorEmail !== currentUserEmail) {
        if (ticket.asignadoA === currentUserEmail) {
          this.ticketForm.get('titulo')?.disable();
          this.ticketForm.get('descripcion')?.disable();
          this.ticketForm.get('asignadoA')?.disable();
          this.ticketForm.get('prioridad')?.disable();
          this.ticketForm.get('fechaLimite')?.disable();
        } else {
          this.ticketForm.disable();
          this.canEditTicket = false;
        }
      }
    }
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

  agregarComentario() {
    const texto = this.ticketForm.get('nuevoComentario')?.value;
    if (!texto || texto.trim() === '') return;

    const currentUser = this.authService.getCurrentUser()?.nombreCompleto || 'Usuario';
    const nuevoComentarioObj = {
      autor: currentUser,
      fecha: new Date(),
      texto: texto.trim(),
    };

    this.currentTicket.comentariosList.push(nuevoComentarioObj);

    const ticketToUpdate = { ...this.currentTicket };
    this.groupService.updateTicket(this.grupoId!, ticketToUpdate);
    this.loadGroup();

    this.ticketForm.get('nuevoComentario')?.reset();
    this.messageService.add({
      severity: 'success',
      summary: 'Comentario añadido',
      detail: 'Tu nota ha sido guardada.',
    });
  }

  guardarTicket() {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const formValue = this.ticketForm.getRawValue();
    const currentUser = this.authService.getCurrentUser()?.nombreCompleto || 'Usuario';
    const currentUserEmail = this.authService.getCurrentUser()?.email;
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
    if (
      formValue.asignadoA &&
      formValue.asignadoA.trim() !== '' &&
      !this.grupo.integrantesList.includes(formValue.asignadoA)
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El usuario asignado no pertenece al grupo',
        life: 3000,
      });
      return;
    }

    formValue.comentariosList = this.currentTicket?.comentariosList || [];

    if (this.isEditTicketMode) {
      const index = this.grupo.ticketsList.findIndex((t: any) => t.id === formValue.id);
      const ticketAnterior = this.grupo.ticketsList[index];

      let historial = [...(ticketAnterior.historial || [])];
      let cambios = [];

      if (ticketAnterior.estado !== formValue.estado)
        cambios.push(`cambió el estado a '${formValue.estado}'`);
      if (ticketAnterior.asignadoA !== formValue.asignadoA)
        cambios.push(`reasignó la tarea a '${formValue.asignadoA || 'Nadie'}'`);
      if (ticketAnterior.prioridad !== formValue.prioridad)
        cambios.push(`cambió la prioridad a '${formValue.prioridad}'`);

      if (cambios.length > 0) {
        historial.push({
          fecha: new Date(),
          descripcion: `${currentUser} ${cambios.join(', ')}`,
        });
      }

      formValue.historial = historial;
      this.groupService.updateTicket(this.grupoId!, formValue);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Ticket actualizado',
      });
    } else {
      formValue.fechaCreacion = new Date();
      formValue.autorEmail = currentUserEmail;
      formValue.historial = [
        {
          fecha: new Date(),
          descripcion: `${currentUser} creó el ticket`,
        },
      ];

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
