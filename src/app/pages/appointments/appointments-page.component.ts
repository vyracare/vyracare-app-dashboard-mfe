import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VcButtonComponent, VcHeadingComponent, VcTextComponent } from '@vyracare/design-system';
import { Subject, catchError, debounceTime, of, switchMap } from 'rxjs';
import {
  Appointment,
  CreateAppointmentRequest,
  EmployeeLookup,
  ProceedingLookup,
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly employeeSearch = new Subject<string>();
  private readonly proceedingSearch = new Subject<string>();
  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly reminderModalOpen = signal(false);
  readonly formModalOpen = signal(false);
  readonly reminderValue = signal<number | null>(null);
  readonly reminderUnit = signal<ReminderOffsetUnit>('Hours');
  readonly employeeResults = signal<EmployeeLookup[]>([]);
  readonly proceedingResults = signal<ProceedingLookup[]>([]);
  readonly selectedEmployee = signal<EmployeeLookup | null>(null);
  readonly selectedProceeding = signal<ProceedingLookup | null>(null);
  readonly employeeQuery = signal('');
  readonly proceedingQuery = signal('');
  readonly employeeLoading = signal(false);
  readonly proceedingLoading = signal(false);
  readonly employeeOpen = signal(false);
  readonly proceedingOpen = signal(false);
  readonly employeeLookupError = signal('');
  readonly proceedingLookupError = signal('');

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
  ) {
    this.employeeSearch.pipe(
      debounceTime(250),
      switchMap(search => {
        this.employeeLoading.set(true);
        this.employeeLookupError.set('');
        return this.dashboardService.searchEmployees(search).pipe(
          catchError(() => {
            this.employeeLookupError.set('Nao foi possivel pesquisar os funcionarios.');
            return of([]);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(employees => {
      this.employeeResults.set(employees);
      this.employeeLoading.set(false);
    });

    this.proceedingSearch.pipe(
      debounceTime(250),
      switchMap(search => {
        this.proceedingLoading.set(true);
        this.proceedingLookupError.set('');
        return this.dashboardService.searchProceedings(search).pipe(
          catchError(() => {
            this.proceedingLookupError.set('Nao foi possivel pesquisar os procedimentos.');
            return of([]);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(proceedings => {
      this.proceedingResults.set(proceedings);
      this.proceedingLoading.set(false);
    });
  }

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
    this.closeAutocompletePanels();
  }

  searchEmployee(value: string): void {
    this.employeeQuery.set(value);
    this.selectedEmployee.set(null);
    this.employeeOpen.set(true);
    this.employeeLookupError.set('');
    if (value.trim().length < 2) {
      this.employeeResults.set([]);
      this.employeeLoading.set(false);
      return;
    }
    this.employeeLoading.set(true);
    this.employeeSearch.next(value.trim());
  }

  searchProceeding(value: string): void {
    this.proceedingQuery.set(value);
    this.selectedProceeding.set(null);
    this.proceedingOpen.set(true);
    this.proceedingLookupError.set('');
    if (value.trim().length < 2) {
      this.proceedingResults.set([]);
      this.proceedingLoading.set(false);
      return;
    }
    this.proceedingLoading.set(true);
    this.proceedingSearch.next(value.trim());
  }

  selectEmployee(employee: EmployeeLookup): void {
    this.selectedEmployee.set(employee);
    this.employeeQuery.set(employee.fullName);
    this.form.controls.employeeName.setValue(employee.fullName);
    this.employeeOpen.set(false);
  }

  selectProceeding(proceeding: ProceedingLookup): void {
    this.selectedProceeding.set(proceeding);
    this.proceedingQuery.set(proceeding.name);
    this.form.controls.proceedingName.setValue(proceeding.name);
    this.proceedingOpen.set(false);
  }

  closeAutocompletePanels(): void {
    this.employeeOpen.set(false);
    this.proceedingOpen.set(false);
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

    const employee = this.selectedEmployee();
    const proceeding = this.selectedProceeding();
    if (!employee || !proceeding) {
      this.errorMessage.set('Selecione um funcionario e um procedimento nas opcoes da pesquisa.');
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
      employeeId: employee.id,
      employeeName: employee.fullName,
      proceedingId: proceeding.id,
      proceedingName: proceeding.name,
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
        this.selectedEmployee.set(null);
        this.selectedProceeding.set(null);
        this.employeeQuery.set('');
        this.proceedingQuery.set('');
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
