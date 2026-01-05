import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardQuickAccessComponent } from './dashboard-quick-access.component';

describe('DashboardQuickAccessComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardQuickAccessComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();
  });

  it('should render the quick access header', () => {
    const fixture = TestBed.createComponent(DashboardQuickAccessComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Acesso rapido');
  });

  it('should list four quick access cards', () => {
    const fixture = TestBed.createComponent(DashboardQuickAccessComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.quick-card');
    expect(cards.length).toBe(4);
  });
});
