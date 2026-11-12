import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DashboardHeroComponent } from './components/dashboard-hero/dashboard-hero.component';
import { DashboardQuickAccessComponent } from './components/dashboard-quick-access/dashboard-quick-access.component';
import { DashboardFinanceComponent } from './components/dashboard-finance/dashboard-finance.component';
import { AppointmentNotificationService } from './services/appointment-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardHeroComponent, DashboardQuickAccessComponent, DashboardFinanceComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  constructor(private readonly notificationService: AppointmentNotificationService) {}

  ngOnInit(): void {
    this.notificationService.start();
  }
}
