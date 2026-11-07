/**
 * Reports: plain text tables and summaries built from the other modules.
 */

import type { Catalog } from "./catalog.ts";
import { daysBetween, isAfter, isBefore, isValidDate } from "./dates.ts";
import type { IsoDate } from "./dates.ts";
import { formatCents } from "./fees.ts";
import type { FeeLedger } from "./fees.ts";
import type { Loan } from "./loans.ts";
import type { MemberRegistry } from "./members.ts";

/** The error that the report module throws for bad input. */
export class ReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportError";
  }
}

/** How the text of a column lines up. */
export type Alignment = "left" | "right";

/** One column of a table. The key names the field of each row. */
export interface Column {
  key: string;
  title: string;
  align: Alignment;
}

/** One row of a table. A row maps column keys to values. */
export type Row = Record<string, string | number>;

/** One line of the overdue report. */
export interface OverdueRow {
  title: string;
  member: string;
  due: IsoDate;
  daysLate: number;
}

/** One line of the popular books report. */
export interface PopularRow {
  bookId: string;
  title: string;
  loans: number;
}

/** The summary of one member. */
export interface MemberSummary {
  memberId: string;
  name: string;
  activeLoans: Loan[];
  overdueCount: number;
  balanceCents: number;
}

/** One line of the fees report. */
export interface FeesRow {
  memberId: string;
  name: string;
  balanceCents: number;
}

/** The column layout of the overdue report, for use with formatTable. */
export const OVERDUE_COLUMNS: Column[] = [
  { key: "title", title: "Title", align: "left" },
  { key: "member", title: "Member", align: "left" },
  { key: "due", title: "Due", align: "left" },
  { key: "daysLate", title: "Days late", align: "right" },
];

/** The column layout of the fees report, for use with formatTable. */
export const FEES_COLUMNS: Column[] = [
  { key: "name", title: "Member", align: "left" },
  { key: "balance", title: "Balance", align: "right" },
];

/** Pad a text to a width, on the side that the alignment asks for. */
function pad(text: string, width: number, align: Alignment): string {
  return align === "right" ? text.padStart(width) : text.padEnd(width);
}

/**
 * Format rows as plain text. The first line is the header with the column
 * titles, the second line is a rule of dashes, and each row follows. Each
 * column is as wide as its longest text. Columns are separated by two spaces.
 * A row without a value for a column shows an empty text. No line ends with a space.
 */
export function formatTable(rows: Row[], columns: Column[]): string {
  if (columns.length === 0) {
    throw new ReportError("A table needs at least one column");
  }
  const cells = rows.map((row) => columns.map((column) => String(row[column.key] ?? "")));
  const widths = columns.map((column, index) => {
    let width = column.title.length;
    for (const line of cells) {
      width = Math.max(width, (line[index] as string).length);
    }
    return width;
  });
  const render = (values: string[]): string =>
    values
      .map((value, index) => pad(value, widths[index] as number, (columns[index] as Column).align))
      .join("  ")
      .trimEnd();
  const header = render(columns.map((column) => column.title));
  const rule = render(widths.map((width) => "-".repeat(width)));
  return [header, rule, ...cells.map(render)].join("\n");
}

/**
 * List the loans that are overdue on a date. Each row has the title of the
 * book, the name of the member, the due date and the days late. The rows are
 * sorted by days late, with the highest first. Equal rows sort by title, then
 * by member name.
 */
export function overdueReport(
  loans: Loan[],
  catalog: Catalog,
  members: MemberRegistry,
  today: IsoDate,
): OverdueRow[] {
  if (!isValidDate(today)) {
    throw new ReportError(`Invalid date: ${String(today)}`);
  }
  const rows: OverdueRow[] = [];
  for (const loan of loans) {
    if (loan.returned !== undefined || loan.lost === true) continue;
    if (!isAfter(today, loan.due)) continue;
    rows.push({
      title: catalog.getBook(loan.bookId).title,
      member: members.get(loan.memberId).name,
      due: loan.due,
      daysLate: daysBetween(loan.due, today),
    });
  }
  return rows.sort(
    (a, b) =>
      b.daysLate - a.daysLate || a.title.localeCompare(b.title) || a.member.localeCompare(b.member),
  );
}

/**
 * Find the books with the most loans since a date. A loan counts when its
 * start date is on or after the date. Equal counts sort by title. The limit
 * is a positive whole number.
 */
export function popularBooks(
  loans: Loan[],
  catalog: Catalog,
  since: IsoDate,
  limit: number,
): PopularRow[] {
  if (!isValidDate(since)) {
    throw new ReportError(`Invalid date: ${String(since)}`);
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new ReportError(`The limit must be a positive whole number: ${limit}`);
  }
  const counts = new Map<string, number>();
  for (const loan of loans) {
    if (isBefore(loan.start, since)) continue;
    counts.set(loan.bookId, (counts.get(loan.bookId) ?? 0) + 1);
  }
  const rows: PopularRow[] = [...counts.entries()].map(([bookId, count]) => ({
    bookId,
    title: catalog.getBook(bookId).title,
    loans: count,
  }));
  rows.sort((a, b) => b.loans - a.loans || a.title.localeCompare(b.title));
  return rows.slice(0, limit);
}

/**
 * Summarize one member: the active loans, the number of overdue loans and the
 * balance. A loan is overdue on the date "today". When the caller passes no
 * date, the summary uses the latest start date of the active loans (see summaryDate).
 */
export function memberSummary(
  memberId: string,
  loans: Loan[],
  ledger: FeeLedger,
  members: MemberRegistry,
  today?: IsoDate,
): MemberSummary {
  const member = members.get(memberId);
  const active = loans.filter(
    (loan) => loan.memberId === memberId && loan.returned === undefined && loan.lost !== true,
  );
  const reference = today ?? summaryDate(active);
  const overdueCount =
    reference === undefined ? 0 : active.filter((loan) => isAfter(reference, loan.due)).length;
  return {
    memberId,
    name: member.name,
    activeLoans: active,
    overdueCount,
    balanceCents: ledger.balance(memberId),
  };
}

/**
 * Pick the day that a summary uses to judge "overdue" when the caller names
 * none: the latest start date among the loans. It returns undefined for an empty list.
 */
export function summaryDate(loans: Loan[]): IsoDate | undefined {
  let latest: IsoDate | undefined;
  for (const loan of loans) {
    if (latest === undefined || isAfter(loan.start, latest)) latest = loan.start;
  }
  return latest;
}

/**
 * List the members with a balance above 0. The member with the highest balance
 * comes first. Equal balances sort by name.
 */
export function feesReport(ledger: FeeLedger, members: MemberRegistry): FeesRow[] {
  const rows: FeesRow[] = [];
  for (const member of members.list()) {
    const balance = ledger.balance(member.id);
    if (balance > 0) {
      rows.push({ memberId: member.id, name: member.name, balanceCents: balance });
    }
  }
  return rows.sort((a, b) => b.balanceCents - a.balanceCents || a.name.localeCompare(b.name));
}

/** Turn the rows of the overdue report into table rows and format them as text. */
export function renderOverdue(rows: OverdueRow[]): string {
  return formatTable(
    rows.map((row) => ({ ...row })),
    OVERDUE_COLUMNS,
  );
}

/** Turn the rows of the fees report into table rows and format them as text. */
export function renderFees(rows: FeesRow[]): string {
  return formatTable(
    rows.map((row) => ({ name: row.name, balance: formatCents(row.balanceCents) })),
    FEES_COLUMNS,
  );
}

/** One line of the stock report. */
export interface StockRow {
  title: string;
  author: string;
  available: number;
  total: number;
}

/**
 * List the stock of the catalog: for each book the title, the author, the
 * copies that a member can borrow and the copies in total. Sorted by title.
 */
export function stockReport(catalog: Catalog): StockRow[] {
  return catalog.listBooks().map((book) => ({
    title: book.title,
    author: book.author,
    available: catalog.availableCopies(book.id).length,
    total: catalog.copiesOf(book.id).length,
  }));
}

/** The column layout of the stock report, for use with formatTable. */
export const STOCK_COLUMNS: Column[] = [
  { key: "title", title: "Title", align: "left" },
  { key: "author", title: "Author", align: "left" },
  { key: "available", title: "Available", align: "right" },
  { key: "total", title: "Total", align: "right" },
];

/** Turn the rows of the stock report into table rows and format them as text. */
export function renderStock(rows: StockRow[]): string {
  return formatTable(
    rows.map((row) => ({ ...row })),
    STOCK_COLUMNS,
  );
}

/**
 * Count the loans per month of the start date. The key is "YYYY-MM". The
 * result is sorted by key.
 */
export function loansPerMonth(loans: Loan[]): Array<{ month: string; loans: number }> {
  const counts = new Map<string, number>();
  for (const loan of loans) {
    const month = loan.start.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, loans: count }));
}
