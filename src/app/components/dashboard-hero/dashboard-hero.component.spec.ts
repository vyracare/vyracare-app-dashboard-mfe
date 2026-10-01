import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardHeroComponent } from './dashboard-hero.component';
import { DashboardService } from '../../services/dashboard.service';
import { of } from 'rxjs';

const summary = {
  referenceDate: '2026-09-30',
  timeZone: 'America/Sao_Paulo',
  appointmentsToday: { total: 18, confirmedLastTwoHours: 4 },
  pendingReturns: { total: 6, windowDays: 3 },
  weeklyOccupancy: { percentage: 82, bookedMinutes: 1968, availableMinutes: 2400 }
};

describe('DashboardHeroComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHeroComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: DashboardService, useValue: { getSummary: () => of(summary) } }
      ]
    }).compileComponents();
  });

  it('should render the hero headline', () => {
    const fixture = TestBed.createComponent(DashboardHeroComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Visao geral');
  });

  it('should show two primary actions', () => {
    const fixture = TestBed.createComponent(DashboardHeroComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const actions = compiled.querySelectorAll('.hero-actions vc-button');
    expect(actions.length).toBe(2);
  });

  it('should render metrics returned by the API', () => {
    const fixture = TestBed.createComponent(DashboardHeroComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('18');
    expect(fixture.nativeElement.textContent).toContain('+4 confirmados');
    expect(fixture.nativeElement.textContent).toContain('82%');
  });

  it('should navigate to the requested path', () => {
    const fixture = TestBed.createComponent(DashboardHeroComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.navigateTo('/agenda/novo');

    expect(navigateSpy).toHaveBeenCalledWith(['/agenda/novo']);
  });
});
