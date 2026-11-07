/**
 * Date helpers for the lending system.
 *
 * Dates are ISO strings in the form YYYY-MM-DD. Every computation runs in UTC,
 * so a result never depends on the time zone of the machine.
 */

/** A calendar date as an ISO string, for example "2026-03-14". */
export type IsoDate = string;

const MS_PER_DAY = 86_400_000;
const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The error that this module throws for an invalid date or an invalid input. */
export class DateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DateError";
  }
}

/**
 * Check that a value is a real calendar date in the form YYYY-MM-DD.
 * "2026-02-30" is not valid, and "2024-02-29" is valid.
 */
export function isValidDate(value: unknown): value is IsoDate {
  if (typeof value !== "string") return false;
  const match = ISO_PATTERN.exec(value);
  if (match === null) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

/** Return true when the year is a leap year in the Gregorian calendar. */
export function isLeapYear(year: number): boolean {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

/** Return the number of days in a month. The month runs from 1 to 12. */
export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new DateError(`Invalid year or month: ${year}, ${month}`);
  }
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * Parse an ISO date into a Date object at midnight UTC.
 * Throws DateError when the value is not a valid date.
 */
export function parseDate(value: IsoDate): Date {
  if (!isValidDate(value)) {
    throw new DateError(`Invalid date: ${String(value)}`);
  }
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  const result = new Date(0);
  result.setUTCFullYear(year, month - 1, day);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

/** Format a Date object as an ISO date, using its UTC fields. */
export function formatDate(date: Date): IsoDate {
  if (Number.isNaN(date.getTime())) {
    throw new DateError("Cannot format an invalid Date object");
  }
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Add a number of days to a date. A negative number goes back in time.
 * The number of days must be a whole number.
 */
export function addDays(date: IsoDate, days: number): IsoDate {
  if (!Number.isInteger(days)) {
    throw new DateError(`The number of days must be a whole number: ${days}`);
  }
  const base = parseDate(date);
  return formatDate(new Date(base.getTime() + days * MS_PER_DAY));
}

/**
 * Count the whole days from one date to another.
 * The result is negative when "to" is earlier than "from".
 */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const start = parseDate(from).getTime();
  const end = parseDate(to).getTime();
  return Math.round((end - start) / MS_PER_DAY);
}

/** Return true when the first date is strictly earlier than the second. */
export function isBefore(a: IsoDate, b: IsoDate): boolean {
  return daysBetween(a, b) > 0;
}

/** Return true when the first date is strictly later than the second. */
export function isAfter(a: IsoDate, b: IsoDate): boolean {
  return daysBetween(a, b) < 0;
}

/** Return the later of two or more dates. Throws DateError for an empty list. */
export function maxDate(...dates: IsoDate[]): IsoDate {
  if (dates.length === 0) {
    throw new DateError("maxDate needs at least one date");
  }
  let latest = dates[0] as IsoDate;
  parseDate(latest);
  for (const date of dates) {
    if (isAfter(date, latest)) latest = date;
  }
  return latest;
}

/** Return the earlier of two or more dates. Throws DateError for an empty list. */
export function minDate(...dates: IsoDate[]): IsoDate {
  if (dates.length === 0) {
    throw new DateError("minDate needs at least one date");
  }
  let earliest = dates[0] as IsoDate;
  parseDate(earliest);
  for (const date of dates) {
    if (isBefore(date, earliest)) earliest = date;
  }
  return earliest;
}

/** Return the current year in UTC. */
export function currentYear(): number {
  return new Date().getUTCFullYear();
}

/** Return the day of the week for a date, from 0 (Sunday) to 6 (Saturday). */
export function dayOfWeek(date: IsoDate): number {
  return parseDate(date).getUTCDay();
}

/** Return true when the date falls on a Saturday or a Sunday. */
export function isWeekend(date: IsoDate): boolean {
  const day = dayOfWeek(date);
  return day === 0 || day === 6;
}

/** Return the first day of the month of a date. */
export function startOfMonth(date: IsoDate): IsoDate {
  const parsed = parseDate(date);
  parsed.setUTCDate(1);
  return formatDate(parsed);
}

/** Return the last day of the month of a date. */
export function endOfMonth(date: IsoDate): IsoDate {
  const parsed = parseDate(date);
  return formatDate(
    new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 0)),
  );
}

/**
 * List every date from the first date to the last date, both included.
 * Throws DateError when the last date is earlier than the first date.
 */
export function dateRange(from: IsoDate, to: IsoDate): IsoDate[] {
  const length = daysBetween(from, to);
  if (length < 0) {
    throw new DateError(`The range ends (${to}) before it starts (${from})`);
  }
  const result: IsoDate[] = [];
  for (let offset = 0; offset <= length; offset += 1) {
    result.push(addDays(from, offset));
  }
  return result;
}

/** Return true when a date lies between two dates, both included. */
export function isBetween(date: IsoDate, from: IsoDate, to: IsoDate): boolean {
  return !isBefore(date, from) && !isAfter(date, to);
}
