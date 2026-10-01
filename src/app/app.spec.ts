import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { DashboardService } from './services/dashboard.service';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: DashboardService,
          useValue: {
            getSummary: () => of({
              referenceDate: '2026-09-30',
              timeZone: 'America/Sao_Paulo',
              appointmentsToday: { total: 0, confirmedLastTwoHours: 0 },
              pendingReturns: { total: 0, windowDays: 3 },
              weeklyOccupancy: { percentage: 0, bookedMinutes: 0, availableMinutes: 2400 }
            }),
            getFinanceSummary: () => of({
              referenceMonth: '2026-09',
              timeZone: 'America/Sao_Paulo',
              confirmedRevenue: { amount: 0, changePercentage: 0 },
              operatingExpenses: { amount: 0, changePercentage: 0 },
              pendingInvoices: { count: 0, amount: 0 }
            })
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Visao geral');
  });
});
