import { provideZonelessChangeDetection } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AppointmentNotificationService } from '../../services/appointment-notification.service';
import { DashboardService } from '../../services/dashboard.service';
import { AppointmentCreatePageComponent } from './appointment-create.component';

describe('AppointmentCreatePageComponent', () => {
  const dashboardService = { createAppointment: jest.fn(), searchEmployees: jest.fn(), searchProceedings: jest.fn() };
  const employee = { id: 'employee-1', fullName: 'Ana Silva', email: 'ana@teste.com', phone: '1199', role: 'Esteticista' };
  const proceeding = { id: 'proceeding-1', name: 'Consulta', code: 'CON-01', durationMinutes: 60 };
  const notificationService = { requestPermission: jest.fn().mockResolvedValue(true) };

  beforeEach(async () => {
    jest.clearAllMocks();
    dashboardService.searchEmployees.mockReturnValue(of([employee]));
    dashboardService.searchProceedings.mockReturnValue(of([proceeding]));
    await TestBed.configureTestingModule({
      imports: [AppointmentCreatePageComponent],
      providers: [
        provideZonelessChangeDetection(), provideRouter([]),
        { provide: DashboardService, useValue: dashboardService },
        { provide: AppointmentNotificationService, useValue: notificationService }
      ]
    }).compileComponents();
  });

  it('should validate required fields', () => {
    const component = TestBed.createComponent(AppointmentCreatePageComponent).componentInstance;
    component.submit();
    expect(component.errorMessage()).toContain('obrigatórios');
  });

  it('should configure, validate and clear a reminder', async () => {
    const component = TestBed.createComponent(AppointmentCreatePageComponent).componentInstance;
    component.openReminderModal();
    component.reminderForm.setValue({ value: '2', unit: 'Days' });
    await component.saveReminder();
    expect(component.reminderValue()).toBe(2);
    expect(component.reminderUnit()).toBe('Days');
    expect(notificationService.requestPermission).toHaveBeenCalled();
    component.clearReminder();
    expect(component.reminderValue()).toBeNull();
    component.reminderForm.setValue({ value: '0', unit: 'Hours' });
    await component.saveReminder();
    expect(component.errorMessage()).toContain('maior que zero');
  });

  it('should render reminder actions inside the modal footer', () => {
    const fixture = TestBed.createComponent(AppointmentCreatePageComponent);
    fixture.componentInstance.openReminderModal();
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal');
    const actions = Array.from(modal.querySelectorAll('.modal-actions button')).map(
      (button: Element) => button.textContent?.trim()
    );

    expect(actions).toEqual(['Remover lembrete', 'Cancelar', 'Salvar']);
  });

  it('should create an appointment and return to the list', () => {
    dashboardService.createAppointment.mockReturnValue(of({}));
    const component = TestBed.createComponent(AppointmentCreatePageComponent).componentInstance;
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.form.setValue({ patientName: 'Maria', phoneNumber: '11999999999', employeeName: 'Ana', proceedingName: 'Consulta', startsAt: '2026-10-05T10:00', endsAt: '2026-10-05T11:00' });
    component.selectEmployee(employee);
    component.selectProceeding(proceeding);
    component.submit();
    expect(dashboardService.createAppointment).toHaveBeenCalledWith(expect.objectContaining({ patientName: 'Maria', employeeId: 'employee-1', proceedingId: 'proceeding-1' }));
    expect(navigate).toHaveBeenCalledWith(['/dashboard/agenda']);
  });

  it('should reject invalid times, require selections and report API failures', () => {
    const component = TestBed.createComponent(AppointmentCreatePageComponent).componentInstance;
    component.form.setValue({ patientName: 'Maria', phoneNumber: '11999999999', employeeName: 'Ana', proceedingName: 'Consulta', startsAt: '2026-10-05T11:00', endsAt: '2026-10-05T10:00' });
    component.submit();
    expect(component.errorMessage()).toContain('Selecione');
    component.selectEmployee(employee);
    component.selectProceeding(proceeding);
    component.submit();
    expect(component.errorMessage()).toContain('posterior');
    dashboardService.createAppointment.mockReturnValue(throwError(() => ({ error: { message: 'Conflito' } })));
    component.form.patchValue({ endsAt: '2026-10-05T12:00' });
    component.submit();
    expect(component.errorMessage()).toBe('Não foi possível salvar o atendimento. Tente novamente.');
  });

  it('should use shared phone and date-time inputs', () => {
    const fixture = TestBed.createComponent(AppointmentCreatePageComponent);
    fixture.detectChanges();
    const phoneInput: HTMLInputElement = fixture.nativeElement.querySelector('vc-phone-input input');
    const dateTimeInputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('vc-date-time-input input'));
    phoneInput.value = '11987654321';
    phoneInput.dispatchEvent(new Event('input'));
    expect(phoneInput.value).toBe('(11) 98765-4321');
    expect(dateTimeInputs).toHaveLength(2);
    expect(dateTimeInputs.every(input => input.type === 'datetime-local')).toBe(true);
  });

  it('should search, map and select employees and proceedings', fakeAsync(() => {
    const component = TestBed.createComponent(AppointmentCreatePageComponent).componentInstance;
    component.searchEmployee('Ana');
    component.searchProceeding('CON');
    tick(250);
    expect(dashboardService.searchEmployees).toHaveBeenCalledWith('Ana');
    expect(dashboardService.searchProceedings).toHaveBeenCalledWith('CON');
    component.selectEmployeeOption(component.employeeOptions()[0]);
    component.selectProceedingOption(component.proceedingOptions()[0]);
    expect(component.selectedEmployee()?.id).toBe('employee-1');
    expect(component.selectedProceeding()?.id).toBe('proceeding-1');
  }));

  it('should handle short searches and lookup errors', fakeAsync(() => {
    dashboardService.searchEmployees.mockReturnValue(throwError(() => new Error('offline')));
    dashboardService.searchProceedings.mockReturnValue(throwError(() => new Error('offline')));
    const component = TestBed.createComponent(AppointmentCreatePageComponent).componentInstance;
    component.searchEmployee('a');
    component.searchProceeding('c');
    expect(component.employeeResults()).toEqual([]);
    component.searchEmployee('Ana');
    component.searchProceeding('CON');
    tick(250);
    expect(component.employeeLookupError()).toContain('funcionários');
    expect(component.proceedingLookupError()).toContain('procedimentos');
  }));
});
