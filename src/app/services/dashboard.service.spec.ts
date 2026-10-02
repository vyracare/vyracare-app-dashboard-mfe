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

  it('should list appointments', () => {
    service.listAppointments().subscribe();
    const request = http.expectOne(environment.appointmentsApiUrl);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should create an appointment', () => {
    const payload = { patientId: 'Maria' } as never;
    service.createAppointment(payload).subscribe();
    const request = http.expectOne(environment.appointmentsApiUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(payload);
    request.flush({});
  });

  it('should request and acknowledge due notifications', () => {
    service.getDueNotifications().subscribe();
    http.expectOne(`${environment.appointmentsApiUrl}/notifications/due`).flush([]);

    service.acknowledgeNotification('appointment-id').subscribe();
    const request = http.expectOne(`${environment.appointmentsApiUrl}/appointment-id/notifications/acknowledge`);
    expect(request.request.method).toBe('POST');
    request.flush(null);
  });
});
