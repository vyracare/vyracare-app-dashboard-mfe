import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AppointmentsPageComponent } from './appointments-page.component';
import { DashboardService } from '../../services/dashboard.service';
import { AppointmentNotificationService } from '../../services/appointment-notification.service';

describe('AppointmentsPageComponent', () => {
  const dashboardService = {
    listAppointments: jest.fn(),
    createAppointment: jest.fn()
  };
  const notificationService = {
    start: jest.fn(),
    requestPermission: jest.fn().mockResolvedValue(true)
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    dashboardService.listAppointments.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [AppointmentsPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: DashboardService, useValue: dashboardService },
        { provide: AppointmentNotificationService, useValue: notificationService }
      ]
    }).compileComponents();
  });

  it('should load appointments and start notifications', () => {
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    fixture.detectChanges();
    expect(dashboardService.listAppointments).toHaveBeenCalled();
    expect(notificationService.start).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Nenhum atendimento agendado');
    expect(fixture.nativeElement.querySelector('.page-header .header-tag')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.table-toolbar')).not.toBeNull();
  });

  it('should validate required fields', () => {
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.errorMessage()).toContain('obrigatórios');
  });

  it('should configure and clear a reminder', async () => {
    const component = TestBed.createComponent(AppointmentsPageComponent).componentInstance;
    component.openReminderModal();
    await component.saveReminder('2', 'Days');
    expect(component.reminderValue()).toBe(2);
    expect(component.reminderUnit()).toBe('Days');
    expect(notificationService.requestPermission).toHaveBeenCalled();
    component.clearReminder();
    expect(component.reminderValue()).toBeNull();
    await component.saveReminder('3', 'Hours');
    expect(component.reminderUnit()).toBe('Hours');
  });

  it('should reject invalid reminder values', async () => {
    const component = TestBed.createComponent(AppointmentsPageComponent).componentInstance;
    await component.saveReminder('0', 'Hours');
    expect(component.errorMessage()).toContain('maior que zero');
    await component.saveReminder('1.5', 'Hours');
    expect(component.errorMessage()).toContain('maior que zero');
  });

  it('should create an appointment and reload the table', () => {
    dashboardService.createAppointment.mockReturnValue(of({}));
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.setValue({
      patientName: 'Maria', phoneNumber: '11999999999', employeeName: 'Ana',
      proceedingName: 'Consulta', startsAt: '2026-10-05T10:00', endsAt: '2026-10-05T11:00'
    });
    component.submit();
    expect(dashboardService.createAppointment).toHaveBeenCalledWith(expect.objectContaining({ patientName: 'Maria' }));
    expect(component.successMessage()).toContain('sucesso');
  });

  it('should reject invalid time range and handle API errors', () => {
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.setValue({
      patientName: 'Maria', phoneNumber: '11999999999', employeeName: 'Ana',
      proceedingName: 'Consulta', startsAt: '2026-10-05T11:00', endsAt: '2026-10-05T10:00'
    });
    component.submit();
    expect(component.errorMessage()).toContain('posterior');

    dashboardService.createAppointment.mockReturnValue(throwError(() => ({ error: { message: 'Conflito' } })));
    component.form.patchValue({ endsAt: '2026-10-05T12:00' });
    component.submit();
    expect(component.errorMessage()).toBe('Conflito');

    dashboardService.createAppointment.mockReturnValue(throwError(() => ({})));
    component.submit();
    expect(component.errorMessage()).toContain('Não foi possível');
  });

  it('should handle appointment loading errors', () => {
    dashboardService.listAppointments.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage()).toContain('carregar');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should expose status labels and control the appointment modal', () => {
    const component = TestBed.createComponent(AppointmentsPageComponent).componentInstance;
    expect(component.statusLabel('Approaching')).toBe('Próximo');
    component.openFormModal();
    expect(component.formModalOpen()).toBe(true);
    component.closeFormModal();
    expect(component.formModalOpen()).toBe(false);
  });
});
