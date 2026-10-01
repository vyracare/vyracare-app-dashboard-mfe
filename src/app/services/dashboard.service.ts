import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { DashboardSummary } from '../models/dashboard-summary.model';
import { FinanceSummary } from '../models/finance-summary.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${environment.appointmentsApiUrl}/dashboard/summary`);
  }

  getFinanceSummary(): Observable<FinanceSummary> {
    return this.http.get<FinanceSummary>(`${environment.financeApiUrl}/dashboard/summary`);
  }
}
