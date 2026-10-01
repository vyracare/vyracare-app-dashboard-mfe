import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { environment } from '../../environments/environments';

describe('DashboardService', () => {
  let service: DashboardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DashboardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should request the dashboard summary', () => {
    service.getSummary().subscribe();

    const request = http.expectOne(`${environment.appointmentsApiUrl}/dashboard/summary`);
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('should request the finance summary', () => {
    service.getFinanceSummary().subscribe();

    const request = http.expectOne(`${environment.financeApiUrl}/dashboard/summary`);
    expect(request.request.method).toBe('GET');
    request.flush({});
  });
});
