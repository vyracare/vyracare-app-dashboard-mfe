export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'NoShow';
export type ScheduleStatus = 'Scheduled' | 'Approaching' | 'Today' | 'Overdue' | 'Completed' | 'Cancelled' | 'NoShow';
export type ReminderOffsetUnit = 'Hours' | 'Days';

export interface EmployeeLookup {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string | null;
}

export interface ProceedingLookup {
  id: string;
  name: string;
  code: string;
  durationMinutes: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  employeeId: string;
  employeeName: string;
  proceedingId: string;
  proceedingName: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  scheduleStatus: ScheduleStatus;
  reminderAt: string | null;
  notificationSentAt: string | null;
}

export interface CreateAppointmentRequest {
  patientId: string;
  patientName: string;
  phoneNumber: string;
  employeeId: string;
  employeeName: string;
  proceedingId: string;
  proceedingName: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  reminderOffsetValue: number | null;
  reminderOffsetUnit: ReminderOffsetUnit | null;
}

export interface AppointmentNotification {
  appointmentId: string;
  title: string;
  message: string;
  startsAt: string;
  reminderAt: string;
}
