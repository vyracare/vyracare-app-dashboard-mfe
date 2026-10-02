import { Routes } from '@angular/router';
import { App } from './app';
import { AppointmentsPageComponent } from './pages/appointments/appointments-page.component';

export const routes: Routes = [
  { path: '', component: App },
  { path: 'agenda/novo', component: AppointmentsPageComponent }
];

export const ROUTES: Routes = routes;
