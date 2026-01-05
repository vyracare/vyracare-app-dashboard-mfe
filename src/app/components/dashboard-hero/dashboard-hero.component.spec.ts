import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardHeroComponent } from './dashboard-hero.component';

describe('DashboardHeroComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHeroComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();
  });

  it('should render the hero headline', () => {
    const fixture = TestBed.createComponent(DashboardHeroComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Visao geral');
  });

  it('should show two primary actions', () => {
    const fixture = TestBed.createComponent(DashboardHeroComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const actions = compiled.querySelectorAll('.hero-actions a');
    expect(actions.length).toBe(2);
  });
});
