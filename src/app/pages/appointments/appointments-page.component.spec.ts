import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AppointmentNotificationService } from '../../services/appointment-notification.service';
import { DashboardService } from '../../services/dashboard.service';
import { AppointmentsPageComponent } from './appointments-page.component';

describe('AppointmentsPageComponent', () => {
  const dashboardService = { listAppointments: jest.fn() };
  const notificationService = { start: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    dashboardService.listAppointments.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [AppointmentsPageComponent],
      providers: [
        provideZonelessChangeDetection(), provideRouter([]),
        { provide: DashboardService, useValue: dashboardService },
        { provide: AppointmentNotificationService, useValue: notificationService }
      ]
    }).compileComponents();
  });

  it('should load appointments, start notifications and expose the create route', () => {
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    fixture.detectChanges();
    expect(dashboardService.listAppointments).toHaveBeenCalled();
    expect(notificationService.start).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Nenhum atendimento agendado');
    expect(fixture.nativeElement.querySelector('.primary-action')?.getAttribute('href')).toBe('/dashboard/agenda/novo');
  });

  it('should handle appointment loading errors', () => {
    dashboardService.listAppointments.mockReturnValue(throwError(() => new Error('offline')));
    const fixture = TestBed.createComponent(AppointmentsPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage()).toContain('carregar');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should expose translated status labels', () => {
    const component = TestBed.createComponent(AppointmentsPageComponent).componentInstance;
    expect(component.statusLabel('Approaching')).toBe('Próximo');
    expect(component.statusLabel('Completed')).toBe('Concluído');
  });
});
