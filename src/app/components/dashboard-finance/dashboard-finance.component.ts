import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  VcButtonComponent,
  VcCardComponent,
  VcHeadingComponent,
  VcTextComponent
} from '@vyracare/design-system';

@Component({
  selector: 'vyracare-dashboard-finance',
  standalone: true,
  imports: [VcButtonComponent, VcCardComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './dashboard-finance.component.html',
  styleUrl: './dashboard-finance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardFinanceComponent {
  constructor(private readonly router: Router) {}

  navigateTo(path: string): void {
    void this.router.navigate([path]);
  }
}
