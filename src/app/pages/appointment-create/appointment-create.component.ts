import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  VcAutocompleteComponent,
  VcButtonComponent,
  VcDateTimeInputComponent,
  VcHeadingComponent,
  VcPhoneInputComponent,
  VcTextComponent
} from '@vyracare/design-system';
import type { VcAutocompleteOption } from '@vyracare/design-system';
import { Subject, catchError, debounceTime, of, switchMap } from 'rxjs';
import {
  CreateAppointmentRequest,
  EmployeeLookup,
  ProceedingLookup,
  ReminderOffsetUnit
} from '../../models/appointment.model';
import { AppointmentNotificationService } from '../../services/appointment-notification.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'vyracare-appointment-create-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    VcAutocompleteComponent,
    VcButtonComponent,
    VcDateTimeInputComponent,
    VcHeadingComponent,
    VcPhoneInputComponent,
    VcTextComponent
  ],
  templateUrl: './appointment-create.component.html',
  styleUrl: './appointment-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Coordena o cadastro de atendimento e suas pesquisas auxiliares. */
export class AppointmentCreatePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly employeeSearch = new Subject<string>();
  private readonly proceedingSearch = new Subject<string>();
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly reminderModalOpen = signal(false);
  readonly reminderValue = signal<number | null>(null);
  readonly reminderUnit = signal<ReminderOffsetUnit>('Hours');
  readonly employeeResults = signal<EmployeeLookup[]>([]);
  readonly proceedingResults = signal<ProceedingLookup[]>([]);
  readonly selectedEmployee = signal<EmployeeLookup | null>(null);
  readonly selectedProceeding = signal<ProceedingLookup | null>(null);
  readonly employeeLoading = signal(false);
  readonly proceedingLoading = signal(false);
  readonly employeeLookupError = signal('');
  readonly proceedingLookupError = signal('');
  readonly employeeOptions = computed<VcAutocompleteOption[]>(() => this.employeeResults().map(employee => ({
    value: employee.id,
    label: employee.fullName,
    description: `${employee.email}${employee.phone ? ` · ${employee.phone}` : ''}`
  })));
  readonly proceedingOptions = computed<VcAutocompleteOption[]>(() => this.proceedingResults().map(proceeding => ({
    value: proceeding.id,
    label: proceeding.name,
    description: `${proceeding.code} · ${proceeding.durationMinutes} min`
  })));

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
    private readonly notificationService: AppointmentNotificationService,
    private readonly router: Router
  ) {
    this.employeeSearch.pipe(
      debounceTime(250),
      switchMap(search => {
        this.employeeLoading.set(true);
        this.employeeLookupError.set('');
        return this.dashboardService.searchEmployees(search).pipe(
          catchError(() => {
            this.employeeLookupError.set('Não foi possível pesquisar os funcionários.');
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
            this.proceedingLookupError.set('Não foi possível pesquisar os procedimentos.');
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

  /** Abre a configuração de antecedência da notificação. */
  openReminderModal(): void {
    this.reminderModalOpen.set(true);
  }

  /** Agenda a pesquisa de funcionários quando existem ao menos dois caracteres. */
  searchEmployee(value: string): void {
    this.selectedEmployee.set(null);
    this.employeeLookupError.set('');
    if (value.trim().length < 2) {
      this.employeeResults.set([]);
      this.employeeLoading.set(false);
      return;
    }
    this.employeeLoading.set(true);
    this.employeeSearch.next(value.trim());
  }

  /** Agenda a pesquisa de procedimentos quando existem ao menos dois caracteres. */
  searchProceeding(value: string): void {
    this.selectedProceeding.set(null);
    this.proceedingLookupError.set('');
    if (value.trim().length < 2) {
      this.proceedingResults.set([]);
      this.proceedingLoading.set(false);
      return;
    }
    this.proceedingLoading.set(true);
    this.proceedingSearch.next(value.trim());
  }

  /** Registra o funcionário escolhido e sincroniza seu nome no formulário. */
  selectEmployee(employee: EmployeeLookup): void {
    this.selectedEmployee.set(employee);
    this.form.controls.employeeName.setValue(employee.fullName);
  }

  /** Registra o procedimento escolhido e sincroniza seu nome no formulário. */
  selectProceeding(proceeding: ProceedingLookup): void {
    this.selectedProceeding.set(proceeding);
    this.form.controls.proceedingName.setValue(proceeding.name);
  }

  /** Resolve uma opção do autocomplete para o funcionário completo. */
  selectEmployeeOption(option: VcAutocompleteOption): void {
    const employee = this.employeeResults().find(item => item.id === option.value);
    if (employee) this.selectEmployee(employee);
  }

  /** Resolve uma opção do autocomplete para o procedimento completo. */
  selectProceedingOption(option: VcAutocompleteOption): void {
    const proceeding = this.proceedingResults().find(item => item.id === option.value);
    if (proceeding) this.selectProceeding(proceeding);
  }

  /** Fecha a configuração de notificação sem alterar o formulário principal. */
  closeReminderModal(): void {
    this.reminderModalOpen.set(false);
  }

  /** Valida e salva a antecedência escolhida depois de solicitar permissão. */
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

  /** Remove a configuração de lembrete do atendimento em edição. */
  clearReminder(): void {
    this.reminderValue.set(null);
    this.closeReminderModal();
  }

  /** Valida as seleções e os horários antes de criar o atendimento pela API. */
  submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Preencha todos os campos obrigatórios.');
      return;
    }

    const employee = this.selectedEmployee();
    const proceeding = this.selectedProceeding();
    if (!employee || !proceeding) {
      this.errorMessage.set('Selecione um funcionário e um procedimento nas opções da pesquisa.');
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
        void this.router.navigate(['/dashboard/agenda']);
      },
      error: error => {
        this.saving.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Não foi possível salvar o atendimento.');
      }
    });
  }

  /** Retorna à listagem sem persistir o formulário. */
  cancel(): void {
    void this.router.navigate(['/dashboard/agenda']);
  }
}
