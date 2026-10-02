import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardFinanceComponent } from './dashboard-finance.component';
import { DashboardService } from '../../services/dashboard.service';
import { of } from 'rxjs';

const financeSummary = {
  referenceMonth: '2026-09',
  timeZone: 'America/Sao_Paulo',
  confirmedRevenue: { amount: 124800, changePercentage: 12 },
  operatingExpenses: { amount: 41200, changePercentage: -6 },
  pendingInvoices: { count: 8, amount: 9600 }
};

describe('DashboardFinanceComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFinanceComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: DashboardService, useValue: { getFinanceSummary: () => of(financeSummary) } }
      ]
    }).compileComponents();
  });

  it('should render the finance header', () => {
    const fixture = TestBed.createComponent(DashboardFinanceComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Saúde financeira');
  });

  it('should render finance metrics returned by the API', () => {
    const fixture = TestBed.createComponent(DashboardFinanceComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('R$ 124,8k');
    expect(text).toContain('-6%');
    expect(text).toContain('R$ 9,6k');
  });

  it('should show three finance cards', () => {
    const fixture = TestBed.createComponent(DashboardFinanceComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.finance-card');
    expect(cards.length).toBe(3);
  });

  it('should navigate to the requested finance path', () => {
    const fixture = TestBed.createComponent(DashboardFinanceComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.navigateTo('/financeiro/receitas');

    expect(navigateSpy).toHaveBeenCalledWith(['/financeiro/receitas']);
  });
});
