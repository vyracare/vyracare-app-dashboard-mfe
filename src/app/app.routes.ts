import { Routes } from '@angular/router';
import { App } from './app';
import { AppointmentsPageComponent } from './pages/appointments/appointments-page.component';
import { AppointmentCreatePageComponent } from './pages/appointment-create/appointment-create.component';

export const routes: Routes = [
  { path: '', component: App },
  { path: 'agenda', component: AppointmentsPageComponent },
  { path: 'agenda/novo', component: AppointmentCreatePageComponent }
];

export const ROUTES: Routes = routes;
