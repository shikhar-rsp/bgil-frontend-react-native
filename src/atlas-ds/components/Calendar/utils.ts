/**
 * Pure date helpers. Kept dependency-free so the component never reaches for
 * heavy libs like moment/dayjs. RN apps care about bundle size.
 */

export const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const WEEKDAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Stable month identity (year * 12 + month) — handy for FlatList keyExtractor. */
export const monthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();

/** A new Date representing the first of `month` offset by `delta` months. */
export const addMonths = (date: Date, delta: number) => {
  const d = new Date(date.getFullYear(), date.getMonth() + delta, 1);
  return d;
};

export const sameDay = (a: Date | null | undefined, b: Date | null | undefined) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const isBetween = (date: Date, start: Date, end: Date) => {
  const t = date.getTime();
  return t > start.getTime() && t < end.getTime();
};

/** Days to render for a month including leading/trailing days from neighbour months
 *  so the grid is always 6 rows × 7 cols = 42 cells. */
export interface DayCell {
  date: Date;
  inMonth: boolean;
}

export const buildMonthGrid = (year: number, month: number): DayCell[] => {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: DayCell[] = [];

  // Leading: previous month's tail
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < firstDow; i++) {
    const day = prevMonthDays - firstDow + i + 1;
    cells.push({ date: new Date(year, month - 1, day), inMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }

  // Trailing: next month head — pad to 42
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, nextDay++), inMonth: false });
  }

  return cells;
};
