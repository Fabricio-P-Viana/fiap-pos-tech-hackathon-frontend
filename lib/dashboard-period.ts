export const DASHBOARD_PERIOD_DAYS = 30;

export type DashboardPeriodInput = {
  from: string;
  to: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateInput(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftDateInput(value: string, days: number): string {
  const date = parseDateInput(value);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function lastDashboardPeriod(
  today: Date = new Date(),
): DashboardPeriodInput {
  const to = toDateInputValue(today);
  return { from: shiftDateInput(to, -(DASHBOARD_PERIOD_DAYS - 1)), to };
}

export function countPeriodDays({ from, to }: DashboardPeriodInput): number {
  const elapsedMs = parseDateInput(to).getTime() - parseDateInput(from).getTime();
  return Math.round(elapsedMs / DAY_MS) + 1;
}

export function validateDashboardPeriod(
  period: DashboardPeriodInput,
): string | null {
  if (!period.from || !period.to) {
    return "Informe a data inicial e a final.";
  }
  if (period.from > period.to) {
    return "A data inicial precisa ser anterior à final.";
  }
  if (countPeriodDays(period) > DASHBOARD_PERIOD_DAYS) {
    return `O período pode ter no máximo ${DASHBOARD_PERIOD_DAYS} dias.`;
  }
  return null;
}

export function toDashboardQuery({ from, to }: DashboardPeriodInput) {
  return {
    from: new Date(`${from}T00:00:00.000`).toISOString(),
    to: new Date(`${to}T23:59:59.999`).toISOString(),
  };
}
