export interface FinanceSummary {
  referenceMonth: string;
  timeZone: string;
  confirmedRevenue: {
    amount: number;
    changePercentage: number;
  };
  operatingExpenses: {
    amount: number;
    changePercentage: number;
  };
  pendingInvoices: {
    count: number;
    amount: number;
  };
}
