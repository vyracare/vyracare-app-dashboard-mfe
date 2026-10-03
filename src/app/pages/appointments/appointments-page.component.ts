import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VcButtonComponent, VcHeadingComponent, VcTextComponent } from '@vyracare/design-system';
import {
  Appointment,
  CreateAppointmentRequest,
  ReminderOffsetUnit,
  ScheduleStatus
} from '../../models/appointment.model';
import { AppointmentNotificationService } from '../../services/appointment-notification.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'vyracare-appointments-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, VcButtonComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './appointments-page.component.html',
  styleUrl: './appointments-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentsPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly reminderModalOpen = signal(false);
  readonly formModalOpen = signal(false);
  readonly reminderValue = signal<number | null>(null);
  readonly reminderUnit = signal<ReminderOffsetUnit>('Hours');

  readonly form = this.formBuilder.nonNullable.group({
    patientName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    employeeName: ['', Validators.required],
    proceedingName: ['', Validators.required],
    startsAt: ['', Validators.required],
    endsAt: ['', Validators.required]
  });

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly notificationService: AppointmentNotificationService
  ) {}

  ngOnInit(): void {
    this.notificationService.start();
    this.loadAppointments();
  }

  openReminderModal(): void {
    this.reminderModalOpen.set(true);
  }

  openFormModal(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.formModalOpen.set(true);
  }

  closeFormModal(): void {
    this.formModalOpen.set(false);
    this.reminderModalOpen.set(false);
  }

  closeReminderModal(): void {
    this.reminderModalOpen.set(false);
  }

  async saveReminder(value: string, unit: string): Promise<void> {
    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      this.errorMessage.set('Informe uma antecedência maior que zero.');
      return;
    }
    this.reminderValue.set(parsedValue);
    this.reminderUnit.set(unit === 'Days' ? 'Days' : 'Hours');
    await this.notificationService.requestPermission();
    this.errorMessage.set('');
    this.closeReminderModal();
  }

  clearReminder(): void {
    this.reminderValue.set(null);
    this.closeReminderModal();
  }

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Preencha todos os campos obrigatórios.');
      return;
    }

    const value = this.form.getRawValue();
    const startsAt = new Date(value.startsAt);
    const endsAt = new Date(value.endsAt);
    if (endsAt <= startsAt) {
      this.errorMessage.set('O horário de término deve ser posterior ao início.');
      return;
    }

    const request: CreateAppointmentRequest = {
      patientId: value.patientName,
      patientName: value.patientName,
      phoneNumber: value.phoneNumber,
      employeeId: value.employeeName,
      employeeName: value.employeeName,
      proceedingId: value.proceedingName,
      proceedingName: value.proceedingName,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: 'Scheduled',
      reminderOffsetValue: this.reminderValue(),
      reminderOffsetUnit: this.reminderValue() ? this.reminderUnit() : null
    };

    this.saving.set(true);
    this.dashboardService.createAppointment(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Atendimento agendado com sucesso.');
        this.form.reset();
        this.reminderValue.set(null);
        this.closeFormModal();
        this.loadAppointments();
      },
      error: error => {
        this.saving.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Não foi possível salvar o atendimento.');
      }
    });
  }

  statusLabel(status: ScheduleStatus): string {
    const labels: Record<ScheduleStatus, string> = {
      Scheduled: 'Agendado',
      Approaching: 'Próximo',
      Today: 'Hoje',
      Overdue: 'Em atraso',
      Completed: 'Concluído',
      Cancelled: 'Cancelado',
      NoShow: 'Não compareceu'
    };
    return labels[status];
  }

  private loadAppointments(): void {
    this.loading.set(true);
    this.dashboardService.listAppointments().subscribe({
      next: appointments => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os agendamentos.');
        this.loading.set(false);
      }
    });
  }
}
