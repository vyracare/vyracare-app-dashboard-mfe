export interface DashboardSummary {
  referenceDate: string;
  timeZone: string;
  appointmentsToday: {
    total: number;
    confirmedLastTwoHours: number;
  };
  pendingReturns: {
    total: number;
    windowDays: number;
  };
  weeklyOccupancy: {
    percentage: number;
    bookedMinutes: number;
    availableMinutes: number;
  };
}
