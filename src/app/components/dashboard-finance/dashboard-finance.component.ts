import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  VcButtonComponent,
  VcCardComponent,
  VcHeadingComponent,
  VcTextComponent
} from '@vyracare/design-system';
import { FinanceSummary } from '../../models/finance-summary.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'vyracare-dashboard-finance',
  standalone: true,
  imports: [VcButtonComponent, VcCardComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './dashboard-finance.component.html',
  styleUrl: './dashboard-finance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardFinanceComponent implements OnInit {
  readonly summary = signal<FinanceSummary | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  constructor(
    private readonly router: Router,
    private readonly dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getFinanceSummary().subscribe({
      next: summary => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      }
    });
  }

  formatCurrency(amount: number): string {
    if (Math.abs(amount) >= 1000) {
      const compact = (amount / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
      return `R$ ${compact}k`;
    }
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatVariation(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
  }

  navigateTo(path: string): void {
    void this.router.navigate([path]);
  }
}
