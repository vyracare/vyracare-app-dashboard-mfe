import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { DashboardSummary } from '../models/dashboard-summary.model';
import { FinanceSummary } from '../models/finance-summary.model';
import {
  Appointment,
  AppointmentNotification,
  CreateAppointmentRequest,
  EmployeeLookup,
  ProceedingLookup
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${environment.appointmentsApiUrl}/dashboard/summary`);
  }

  getFinanceSummary(): Observable<FinanceSummary> {
    return this.http.get<FinanceSummary>(`${environment.financeApiUrl}/dashboard/summary`);
  }

  listAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(environment.appointmentsApiUrl);
  }

  createAppointment(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(environment.appointmentsApiUrl, request);
  }

  searchEmployees(search: string): Observable<EmployeeLookup[]> {
    const params = new HttpParams().set('search', search.trim()).set('limit', 20);
    return this.http.get<EmployeeLookup[]>(`${environment.authenticationApiUrl}/employees`, { params });
  }

  searchProceedings(search: string): Observable<ProceedingLookup[]> {
    const params = new HttpParams()
      .set('search', search.trim())
      .set('activeOnly', true)
      .set('limit', 20);
    return this.http.get<ProceedingLookup[]>(environment.proceedingsApiUrl, { params });
  }

  getDueNotifications(): Observable<AppointmentNotification[]> {
    return this.http.get<AppointmentNotification[]>(`${environment.appointmentsApiUrl}/notifications/due`);
  }

  acknowledgeNotification(appointmentId: string): Observable<void> {
    return this.http.post<void>(
      `${environment.appointmentsApiUrl}/${appointmentId}/notifications/acknowledge`,
      {}
    );
  }
}
