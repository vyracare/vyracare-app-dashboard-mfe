import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardFinanceComponent } from './dashboard-finance.component';

describe('DashboardFinanceComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFinanceComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();
  });

  it('should render the finance header', () => {
    const fixture = TestBed.createComponent(DashboardFinanceComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Saude financeira');
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
