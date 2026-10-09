import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VcHeadingComponent, VcTextComponent, VcToastService } from '@vyracare/design-system';
import { Appointment, ScheduleStatus } from '../../models/appointment.model';
import { AppointmentNotificationService } from '../../services/appointment-notification.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'vyracare-appointments-page',
  standalone: true,
  imports: [CommonModule, RouterLink, VcHeadingComponent, VcTextComponent],
  templateUrl: './appointments-page.component.html',
  styleUrl: './appointments-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Coordena a listagem da agenda e os estados calculados dos atendimentos. */
export class AppointmentsPageComponent implements OnInit {
  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly notificationService: AppointmentNotificationService,
    private readonly toast: VcToastService
  ) {}

  /** Inicia o mecanismo de notificacoes e carrega os atendimentos existentes. */
  ngOnInit(): void {
    this.notificationService.start();
    this.loadAppointments();
  }

  /** Traduz o estado calculado da agenda para o rotulo exibido na tabela. */
  statusLabel(status: ScheduleStatus): string {
    const labels: Record<ScheduleStatus, string> = {
      Scheduled: 'Agendado', Approaching: 'Próximo', Today: 'Hoje', Overdue: 'Em atraso',
      Completed: 'Concluído', Cancelled: 'Cancelado', NoShow: 'Não compareceu'
    };
    return labels[status];
  }

  /** Carrega os atendimentos e atualiza os estados de feedback da pagina. */
  private loadAppointments(): void {
    this.loading.set(true);
    this.dashboardService.listAppointments().subscribe({
      next: appointments => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: () => {
        const message = 'Não foi possível carregar os agendamentos.';
        this.errorMessage.set(message);
        this.toast.error('Falha ao carregar agenda', message);
        this.loading.set(false);
      }
    });
  }
}
