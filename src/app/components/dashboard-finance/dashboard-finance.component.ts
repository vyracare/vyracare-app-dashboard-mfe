import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'vyracare-dashboard-finance',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-finance.component.html',
  styleUrl: './dashboard-finance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardFinanceComponent {}
