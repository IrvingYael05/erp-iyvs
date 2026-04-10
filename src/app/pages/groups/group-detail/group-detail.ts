import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayout } from '../../../layout/main-layout/main-layout';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HasPermission } from '../../../core/directives/permission/has-permission';
import { Permission } from '../../../core/services/permission/permission';
import { GroupService } from '../../../core/services/group/group';
import { UsersService } from '../../../core/services/users/users';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { DragDropModule } from 'primeng/dragdrop';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TicketService } from '../../../core/services/ticket/ticket';

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
  private usersService = inject(UsersService);
  private permissionService = inject(Permission);
  private cdr = inject(ChangeDetectorRef);
  private ticketService = inject(TicketService);

  grupoId: string | null = null;
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

  myLocalPermissions: string[] = [];

  permissionsDialog: boolean = false;
  selectedMemberEmail: string = '';
  selectedMemberId: string = '';
  selectedMemberPermissions: string[] = [];
  ticketPermissions = [
    { key: 'ticket:view', label: 'Ver Tickets' },
    { key: 'ticket:add', label: 'Crear Tickets' },
    { key: 'ticket:edit', label: 'Editar Tickets' },
    { key: 'ticket:delete', label: 'Eliminar Tickets' },
  ];

  get currentUserEmail(): string {
    return this.usersService.getCurrentUser()?.email || '';
  }

  isLoading = true;
  isSaving = false;

  isMembersLoading = true;
  totalMembers = 0;

  isTicketsLoading = true;
  kanbanLimit = 50;
  totalTickets = 0;

  isLoadingTicket = false;
  loadingTicketId: string | null = null;

  isCommenting = false;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.grupoId = params.get('id');

      if (this.grupoId) {
        this.loadGroup();
      } else {
        this.backToMain();
      }
    });
  }

  // Funcionalidades
  // ----- Cargar Grupos -----
  loadGroup() {
    this.isLoading = true;

    this.groupService.getGroupById(this.grupoId!).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.data && res.data[0]) {
          this.grupo = res.data[0];
          this.loadDashboard();
          this.loadMyLocalPermissions();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.backToMain();
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ----- Cargar Dashboard -----
  loadDashboard() {
    this.isLoading = true;
    if (!this.grupoId) return;

    this.ticketService.getTicketStats(this.grupoId).subscribe({
      next: (res) => {
        if (res.data && res.data[0]) {
          this.groupStats = res.data[0];
        }
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    this.ticketService.getTickets(this.grupoId, 1, 5, 'prioridad_alta').subscribe({
      next: (res) => {
        if (res.data && res.data[0]) {
          const payload = res.data[0];
          this.recentOrAssignedTickets = payload.tickets || [];
        }
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ----- Cargar Miembros -----
  loadMembers(event?: TableLazyLoadEvent) {
    if (!this.grupoId) return;

    this.isMembersLoading = true;
    let page = 1;
    let limit = 10;
    let search = '';

    if (event) {
      limit = event.rows || 10;
      page = (event.first || 0) / limit + 1;

      if (event.globalFilter) {
        search = event.globalFilter as string;
      }
    }

    this.groupService.getGroupMembers(this.grupoId, page, limit, search).subscribe({
      next: (res) => {
        if (res.data && res.data[0]) {
          const payload = res.data[0];
          this.integrantesObjList = payload.members || [];
          this.totalMembers = payload.totalRecords || 0;
        }
      },
      complete: () => {
        this.isMembersLoading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.isMembersLoading = false),
    });
  }

  // ----- Agregar Integrante -----
  addMember() {
    if (this.integranteForm.invalid) {
      this.integranteForm.markAllAsTouched();
      return;
    }

    const emailNuevo = this.integranteForm.value.email.toLowerCase().trim();
    this.isSaving = true;

    this.groupService.addGroupMember(this.grupoId!, emailNuevo).subscribe({
      next: (res) => {
        this.isSaving = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: res.data[0].message || 'Integrante agregado correctamente.',
        });

        this.integranteForm.reset();
        this.loadMembers();

        if (res.data[0].member) {
          this.openModalPermissions(res.data[0].member);
        }
      },
      error: (err) => {
        this.isSaving = false;
      },
    });
  }

  // ----- Guardar Permisos Locales -----
  saveLocalPermissions() {
    if (!this.grupoId || !this.selectedMemberId) return;

    this.isSaving = true;

    this.groupService
      .updateMemberPermissions(this.grupoId, this.selectedMemberId, this.selectedMemberPermissions)
      .subscribe({
        next: (res) => {
          this.isSaving = false;
          this.permissionsDialog = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: res.data[0].message || 'Permisos actualizados correctamente',
          });

          this.loadMembers();
        },
        error: () => (this.isSaving = false),
      });
  }

  // ----- Eliminar Integrante -----
  deleteMember(member: any) {
    if (member.email === this.currentUserEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Denegado',
        detail:
          'No puedes eliminarte a ti mismo del grupo. Para abandonarlo, contacta a otro administrador.',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas remover a <b>${member.nombreCompleto}</b> del grupo?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isMembersLoading = true;

        this.groupService.removeMember(this.grupoId!, member.userId).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Removido',
              detail: res.data[0].message || 'El integrante ha sido removido exitosamente.',
            });

            this.loadMembers();
          },
          error: (err) => {
            this.isMembersLoading = false;
          },
        });
      },
    });
  }

  // ----- Cargar Tickets -----
  loadTickets(event?: TableLazyLoadEvent) {
    if (!this.grupoId) return;

    this.isTicketsLoading = true;
    let page = 1;

    let limit = this.vistaTickets === 'kanban' ? this.kanbanLimit : 10;

    if (event && this.vistaTickets === 'tabla') {
      limit = event.rows || 10;
      page = (event.first || 0) / limit + 1;
    }

    this.ticketService.getTickets(this.grupoId, page, limit, this.filtroActual).subscribe({
      next: (res) => {
        if (res.data && res.data[0]) {
          const payload = res.data[0];
          this.ticketsList = payload.tickets || [];
          this.totalTickets = payload.totalRecords || 0;
        } else {
          this.ticketsList = [];
          this.totalTickets = 0;
        }
        this.isTicketsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isTicketsLoading = false;
        this.ticketsList = [];
      },
    });
  }

  // ----- Guardar Ticket -----
  guardarTicket() {
    if (this.ticketForm.invalid) {
      return;
    }

    this.ticketForm.markAllAsTouched();

    this.isSaving = true;
    const formValue = this.ticketForm.value;

    const ticketPayload = {
      grupoId: this.grupoId,
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      estado: formValue.estado,
      prioridad: formValue.prioridad,
      asignadoA: formValue.asignadoA ? formValue.asignadoA.email : null,
      fechaLimite: formValue.fechaLimite ? new Date(formValue.fechaLimite).toISOString() : null,
    };

    if (this.isEditTicketMode) {
      const ticketId = this.currentTicket.id;

      this.ticketService.updateTicket(ticketId, ticketPayload).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.ticketDialog = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Ticket Actualizado',
            detail: res.data[0].message || 'Los cambios se han guardado exitosamente.',
          });

          this.loadTickets();
          this.loadDashboard();
        },
        error: (err) => {
          this.isSaving = false;
        },
      });
    } else {
      this.ticketService.createTicket(ticketPayload).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.ticketDialog = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Ticket Creado',
            detail: 'La tarea se ha registrado exitosamente.',
          });

          this.loadTickets();
          this.loadDashboard();
        },
        error: (err) => {
          this.isSaving = false;
        },
      });
    }
  }

  // ----- Eliminar Ticket -----
  eliminarTicket(ticket: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar el ticket <b>"${ticket.titulo}"</b>? Esta acción es irreversible.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isTicketsLoading = true;

        this.ticketService.deleteTicket(ticket.id).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Ticket Eliminado',
              detail: res.data[0].message || 'El ticket se eliminó correctamente.',
            });

            this.loadTickets();
            this.loadDashboard();
          },
          error: (err) => {
            this.isTicketsLoading = false;
          },
        });
      },
    });
  }

  agregarComentario() {
    const texto = this.ticketForm.get('nuevoComentario')?.value;
    if (!texto || texto.trim() === '') return;

    this.isCommenting = true;
    const ticketId = this.currentTicket.id;

    this.ticketService.addTicketComment(ticketId, texto.trim()).subscribe({
      next: (res) => {
        this.isCommenting = false;

        const nuevoComentarioObj = res.data[0];

        this.currentTicket.comentariosList.push({
          autor: nuevoComentarioObj.autor,
          fecha: nuevoComentarioObj.fecha,
          texto: nuevoComentarioObj.texto,
        });

        this.ticketForm.get('nuevoComentario')?.reset();

        this.messageService.add({
          severity: 'success',
          summary: 'Comentario añadido',
          detail: 'Tu nota ha sido guardada en el ticket.',
        });
      },
      error: (err) => {
        this.isCommenting = false;
      },
    });
  }

  // Utilidades
  // ----- Volver al Directorio -----
  backToMain() {
    this.router.navigate(['/group']);
  }

  // ----- Modal Permisos Locales -----
  openModalPermissions(member: any) {
    if (member.email === this.currentUserEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acción Denegada',
        detail: 'No puedes editar tus propios permisos de grupo.',
      });
      return;
    }

    this.selectedMemberId = member.userId;
    this.selectedMemberEmail = member.email;

    this.selectedMemberPermissions = [...(member.permissions || [])];

    this.permissionsDialog = true;
  }

  // ----- Cambiar Vista de Tickets -----
  cambiarVista(vista: 'tabla' | 'kanban') {
    this.vistaTickets = vista;
    if (vista === 'kanban') {
      this.kanbanLimit = 50;
    }
    this.loadTickets();
  }

  // ----- Aplicar Filtro -----
  aplicarFiltro(nuevoFiltro: 'todos' | 'mis_tickets' | 'sin_asignar' | 'prioridad_alta') {
    this.filtroActual = nuevoFiltro;
    this.loadTickets();
  }

  // ----- Cargar Permisos Locales Personales -----
  loadMyLocalPermissions() {
    if (!this.grupoId || !this.currentUserEmail) return;

    this.groupService.getGroupMembers(this.grupoId, 1, 1, this.currentUserEmail).subscribe({
      next: (res) => {
        if (res.data && res.data[0] && res.data[0].members.length > 0) {
          this.myLocalPermissions = res.data[0].members[0].permissions || [];
        } else {
          this.myLocalPermissions = [];
        }
      },
      complete: () => {
        this.cdr.detectChanges();
      },
    });
  }

  hasLocalPerm(action: string): boolean {
    if (!this.grupoId || !this.currentUserEmail) return false;

    return this.myLocalPermissions.includes(`ticket:${action}`);
  }

  // ----- Manejar Cambios en Permisos Locales -----
  onLocalPermissionChange(event: any, actKey: string) {
    const isChecked = Array.isArray(event.checked) ? event.checked.includes(actKey) : event.checked;

    if (isChecked && actKey !== 'ticket:view') {
      if (!this.selectedMemberPermissions.includes('ticket:view')) {
        this.selectedMemberPermissions = [...this.selectedMemberPermissions, 'ticket:view'];
      }
    } else if (!isChecked && actKey === 'ticket:view') {
      this.selectedMemberPermissions = [];
      this.selectedMemberPermissions = this.selectedMemberPermissions.filter(
        (p) => p !== 'ticket:add' && p !== 'ticket:edit' && p !== 'ticket:delete',
      );
    }
  }

  // ----- Obtener Tickets por Estado (para Kanban) -----
  getTicketsPorEstado(estado: string) {
    return this.ticketsList.filter((t: any) => t.estado === estado);
  }

  // ----- Cargar Más Tickets en Kanban -----
  cargarMasKanban() {
    this.kanbanLimit += 50;
    this.loadTickets();
  }

  // ----- Abrir Modal para Nuevo Ticket -----
  abrirNuevoTicket() {
    this.isEditTicketMode = false;
    this.canEditTicket = true;
    this.ticketForm.enable();

    this.currentTicket = { historial: [], comentariosList: [] };

    this.ticketForm.reset({
      estado: 'Pendiente',
      prioridad: 'Media',
      asignadoA: null,
      fechaLimite: null,
    });

    this.ticketDialog = true;
  }

  // ----- Abrir Modal para Editar Ticket -----
  editarTicket(ticket: any) {
    this.isLoadingTicket = true;
    this.loadingTicketId = ticket.id;
    this.isEditTicketMode = true;
    this.canEditTicket = true;

    this.ticketService.getTicketById(ticket.id).subscribe({
      next: (res) => {
        this.isLoadingTicket = false;
        this.loadingTicketId = null;
        if (res.data && res.data[0]) {
          this.currentTicket = res.data[0];

          let asignadoObj = null;
          if (this.currentTicket.asignadoA) {
            asignadoObj = this.integrantesObjList.find(
              (i) =>
                i.email === this.currentTicket.asignadoA ||
                i.nombreCompleto === this.currentTicket.asignadoA,
            );
          }

          this.ticketForm.patchValue({
            id: this.currentTicket.id,
            titulo: this.currentTicket.titulo,
            descripcion: this.currentTicket.descripcion,
            estado: this.currentTicket.estado,
            prioridad: this.currentTicket.prioridad,
            asignadoA: asignadoObj,
            fechaLimite: this.currentTicket.fechaLimite
              ? new Date(this.currentTicket.fechaLimite)
              : null,
            nuevoComentario: '',
          });

          if (!this.hasLocalPerm('edit')) {
            this.ticketForm.disable();
            this.canEditTicket = false;
          }

          this.ticketDialog = true;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoadingTicket = false;
        this.loadingTicketId = null;
        this.cdr.detectChanges();
      },
    });
  }

  // ----- Búsqueda para Autocomplete de Integrantes -----
  buscarIntegrante(event: any) {
    const query = event.query;
    if (!this.grupoId) return;

    this.groupService.getGroupMembers(this.grupoId, 1, 15, query).subscribe({
      next: (res) => {
        if (res.data && res.data[0]) {
          this.filteredIntegrantes = res.data[0].members || [];
        }
      },
    });
  }

  // ----- Búsqueda para Autocomplete de Estados -----
  buscarEstado(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEstados = this.estados.filter((e) => e.toLowerCase().includes(query));
  }

  // ----- Búsqueda para Autocomplete de Prioridades -----
  buscarPrioridad(event: any) {
    const query = event.query.toLowerCase();
    this.filteredPrioridades = this.prioridades.filter((p) => p.toLowerCase().includes(query));
  }

  // ----- Funciones Drag & Drop para Kanban -----
  dragStart(ticket: any) {
    this.draggedTicket = ticket;
  }

  dragEnd() {
    this.draggedTicket = null;
  }

  drop(estadoDestino: string) {
    if (!this.draggedTicket) return;
    this.loadingTicketId = this.draggedTicket.id;

    if (!this.hasLocalPerm('edit')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acceso Denegado',
        detail: 'No tienes permiso para cambiar el estado de los tickets.',
      });
      this.draggedTicket = null;
      this.loadingTicketId = null;
      return;
    }

    if (this.draggedTicket.estado === estadoDestino) {
      this.draggedTicket = null;
      this.loadingTicketId = null;
      return;
    }

    const ticketId = this.draggedTicket.id;
    const estadoAnterior = this.draggedTicket.estado;

    this.draggedTicket.estado = estadoDestino;
    this.ticketsList = [...this.ticketsList];

    this.ticketService.updateTicketStatus(ticketId, estadoDestino).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'info',
          summary: 'Ticket Actualizado',
          detail: `Movido a ${estadoDestino}`,
        });

        this.loadingTicketId = null;
        this.loadDashboard();
      },
      error: (err) => {
        this.loadingTicketId = null;
        const ticketRevert = this.ticketsList.find((t) => t.id === ticketId);
        if (ticketRevert) {
          ticketRevert.estado = estadoAnterior;
          this.ticketsList = [...this.ticketsList];
        }
      },
    });

    this.draggedTicket = null;
  }

  // ----- Funciones de Utilidad para UI -----
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
