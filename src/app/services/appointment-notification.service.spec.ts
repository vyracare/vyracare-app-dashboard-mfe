import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AppointmentNotificationService } from './appointment-notification.service';
import { DashboardService } from './dashboard.service';

describe('AppointmentNotificationService', () => {
  const dashboardService = {
    getDueNotifications: jest.fn(),
    acknowledgeNotification: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        AppointmentNotificationService,
        { provide: DashboardService, useValue: dashboardService }
      ]
    });
  });

  it('should request browser permission', async () => {
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { requestPermission: jest.fn().mockResolvedValue('granted') }
    });
    const service = TestBed.inject(AppointmentNotificationService);
    await expect(service.requestPermission()).resolves.toBe(true);
  });

  it('should handle denied and unsupported notification permission', async () => {
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { requestPermission: jest.fn().mockResolvedValue('denied') }
    });
    const deniedService = TestBed.inject(AppointmentNotificationService);
    await expect(deniedService.requestPermission()).resolves.toBe(false);

    Object.defineProperty(window, 'Notification', { configurable: true, value: undefined });
    await expect(deniedService.requestPermission()).resolves.toBe(false);
    deniedService.start();
    expect(dashboardService.getDueNotifications).not.toHaveBeenCalled();
  });

  it('should show and acknowledge due notifications', fakeAsync(() => {
    const notificationConstructor = jest.fn();
    Object.assign(notificationConstructor, { permission: 'granted' });
    Object.defineProperty(window, 'Notification', { configurable: true, value: notificationConstructor });
    dashboardService.getDueNotifications.mockReturnValue(of([{
      appointmentId: '1', title: 'Atendimento', message: 'Em uma hora'
    }]));
    dashboardService.acknowledgeNotification.mockReturnValue(of(undefined));

    TestBed.inject(AppointmentNotificationService).start();
    tick(0);

    expect(notificationConstructor).toHaveBeenCalledWith('Atendimento', expect.objectContaining({ body: 'Em uma hora' }));
    expect(dashboardService.acknowledgeNotification).toHaveBeenCalledWith('1');
    discardPeriodicTasks();
  }));

  it('should tolerate polling errors', fakeAsync(() => {
    const notificationConstructor = jest.fn();
    Object.assign(notificationConstructor, { permission: 'granted' });
    Object.defineProperty(window, 'Notification', { configurable: true, value: notificationConstructor });
    dashboardService.getDueNotifications.mockReturnValue(throwError(() => new Error('offline')));

    TestBed.inject(AppointmentNotificationService).start();
    tick(0);

    expect(notificationConstructor).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should not display notifications without permission or start twice', fakeAsync(() => {
    const notificationConstructor = jest.fn();
    Object.assign(notificationConstructor, { permission: 'denied' });
    Object.defineProperty(window, 'Notification', { configurable: true, value: notificationConstructor });
    dashboardService.getDueNotifications.mockReturnValue(of([{
      appointmentId: '1', title: 'Atendimento', message: 'Em uma hora'
    }]));
    const service = TestBed.inject(AppointmentNotificationService);
    service.start();
    service.start();
    tick(0);
    expect(dashboardService.getDueNotifications).toHaveBeenCalledTimes(1);
    expect(notificationConstructor).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));
});
