import { Injectable } from '@angular/core';
import { catchError, of, switchMap, timer } from 'rxjs';
import { DashboardService } from './dashboard.service';

@Injectable({ providedIn: 'root' })
export class AppointmentNotificationService {
  private started = false;

  constructor(private readonly dashboardService: DashboardService) {}

  start(): void {
    if (this.started || !this.isSupported()) return;
    this.started = true;

    timer(0, 60_000)
      .pipe(
        switchMap(() =>
          this.dashboardService.getDueNotifications().pipe(catchError(() => of([])))
        )
      )
      .subscribe(notifications => {
        if (Notification.permission !== 'granted') return;
        notifications.forEach(notification => {
          new Notification(notification.title, {
            body: notification.message,
            tag: `appointment-${notification.appointmentId}`
          });
          this.dashboardService.acknowledgeNotification(notification.appointmentId).subscribe({
            error: () => undefined
          });
        });
      });
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    return (await Notification.requestPermission()) === 'granted';
  }

  private isSupported(): boolean {
    return typeof Notification !== 'undefined';
  }
}
