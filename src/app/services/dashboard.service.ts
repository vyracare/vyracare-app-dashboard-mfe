import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { DashboardSummary } from '../models/dashboard-summary.model';
import { FinanceSummary } from '../models/finance-summary.model';
import {
  Appointment,
  AppointmentNotification,
  CreateAppointmentRequest
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
