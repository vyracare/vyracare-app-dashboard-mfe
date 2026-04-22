import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  VcButtonComponent,
  VcCardComponent,
  VcHeadingComponent,
  VcTextComponent
} from '@vyracare/design-system';

@Component({
  selector: 'vyracare-dashboard-hero',
  standalone: true,
  imports: [VcButtonComponent, VcCardComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './dashboard-hero.component.html',
  styleUrl: './dashboard-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHeroComponent {
  constructor(private readonly router: Router) {}

  navigateTo(path: string): void {
    void this.router.navigate([path]);
  }
}
