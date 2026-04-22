import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VcCardButtonComponent, VcHeadingComponent, VcTextComponent } from '@vyracare/design-system';

@Component({
  selector: 'vyracare-dashboard-quick-access',
  standalone: true,
  imports: [VcCardButtonComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './dashboard-quick-access.component.html',
  styleUrl: './dashboard-quick-access.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardQuickAccessComponent {}
