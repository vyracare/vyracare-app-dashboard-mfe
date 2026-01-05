import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'vyracare-dashboard-quick-access',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-quick-access.component.html',
  styleUrl: './dashboard-quick-access.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardQuickAccessComponent {}
