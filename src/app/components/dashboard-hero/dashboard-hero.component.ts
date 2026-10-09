import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  VcButtonComponent,
  VcCardComponent,
  VcHeadingComponent,
  VcTextComponent,
  VcToastService
} from '@vyracare/design-system';
import { DashboardSummary } from '../../models/dashboard-summary.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'vyracare-dashboard-hero',
  standalone: true,
  imports: [VcButtonComponent, VcCardComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './dashboard-hero.component.html',
  styleUrl: './dashboard-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHeroComponent implements OnInit {
  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  constructor(
    private readonly router: Router,
    private readonly dashboardService: DashboardService,
    private readonly toast: VcToastService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: summary => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
        this.toast.error('Falha ao carregar o painel', 'Não foi possível consultar o resumo da clínica.');
      }
    });
  }

  navigateTo(path: string): void {
    void this.router.navigate([path]);
  }
}
