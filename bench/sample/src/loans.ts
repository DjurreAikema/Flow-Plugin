/**
 * Loans: lending, renewing and returning copies.
 *
 * The loan service ties the catalog, the members and the fee ledger together.
 */

import type { Catalog } from "./catalog.ts";
import { addDays, daysBetween, isAfter, isValidDate } from "./dates.ts";
import type { IsoDate } from "./dates.ts";
import { LOST_COPY_FEE_CENTS, calculateLateFee } from "./fees.ts";
import type { FeeLedger } from "./fees.ts";
import type { MemberRegistry } from "./members.ts";

/** The error that the loan service throws when a rule refuses an action. */
export class LoanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoanError";
  }
}

/** One loan of one copy to one member. A loan id has the form "L<n>". */
export interface Loan {
  id: string;
  copyId: string;
  bookId: string;
  memberId: string;
  start: IsoDate;
  due: IsoDate;
  returned?: IsoDate;
  renewals: number;
  lost?: boolean;
}

/** The result of a return: the closed loan and the late fee that it caused, in cents. */
export interface ReturnResult {
  loan: Loan;
  feeCents: number;
}

/** Check a "today" argument. Throws LoanError for an invalid date. */
function requireToday(today: IsoDate): void {
  if (!isValidDate(today)) {
    throw new LoanError(`Invalid date: ${String(today)}`);
  }
}

/** Make a copy of a loan, so that a caller cannot change the service. */
function cloneLoan(loan: Loan): Loan {
  return { ...loan };
}

/** The loan service. */
export class LoanService {
  private readonly catalog: Catalog;
  private readonly members: MemberRegistry;
  private readonly ledger: FeeLedger;
  private readonly loans = new Map<string, Loan>();
  private nextId = 1;

  /** Make a loan service on top of a catalog, a member registry and a fee ledger. */
  constructor(catalog: Catalog, members: MemberRegistry, ledger: FeeLedger) {
    this.catalog = catalog;
    this.members = members;
    this.ledger = ledger;
  }

  /**
   * Lend the first available copy of a book to a member.
   *
   * The service refuses when the member is suspended, has the most active loans
   * that the tier allows, has an overdue loan, or is over the fee threshold. It
   * also refuses when the book has no available copy. The due date is today plus
   * the loan days of the tier.
   */
  checkout(memberId: string, bookId: string, today: IsoDate): Loan {
    requireToday(today);
    const member = this.members.get(memberId);
    const rules = this.members.rulesFor(memberId);
    if (!this.catalog.hasBook(bookId)) {
      throw new LoanError(`Unknown book id: ${bookId}`);
    }
    if (member.status === "suspended") {
      throw new LoanError(`Member ${memberId} is suspended`);
    }
    const active = this.activeLoans(memberId);
    if (active.length >= rules.maxLoans) {
      throw new LoanError(`Member ${memberId} has ${rules.maxLoans} active loans already`);
    }
    if (active.some((loan) => isAfter(today, loan.due))) {
      throw new LoanError(`Member ${memberId} has an overdue loan`);
    }
    if (this.ledger.isOverThreshold(memberId)) {
      throw new LoanError(`Member ${memberId} owes too much in fees`);
    }
    const copy = this.catalog.availableCopies(bookId)[0];
    if (copy === undefined) {
      throw new LoanError(`No copy of book ${bookId} is available`);
    }
    this.catalog.setCopyStatus(copy.id, "on-loan");
    const loan: Loan = {
      id: this.makeId(),
      copyId: copy.id,
      bookId,
      memberId,
      start: today,
      due: addDays(today, rules.loanDays),
      renewals: 0,
    };
    this.loans.set(loan.id, loan);
    return cloneLoan(loan);
  }

  /**
   * Renew a loan. The service refuses when the loan is returned or lost, when
   * it is overdue, or when it has the most renewals that the tier allows. The
   * new due date is today plus the loan days of the tier.
   */
  renew(loanId: string, today: IsoDate): Loan {
    requireToday(today);
    const loan = this.require(loanId);
    if (loan.returned !== undefined) {
      throw new LoanError(`Loan ${loanId} is returned already`);
    }
    if (loan.lost === true) {
      throw new LoanError(`Loan ${loanId} is lost`);
    }
    if (isAfter(today, loan.due)) {
      throw new LoanError(`Loan ${loanId} is overdue`);
    }
    const rules = this.members.rulesFor(loan.memberId);
    if (loan.renewals >= rules.maxRenewals) {
      throw new LoanError(`Loan ${loanId} has ${rules.maxRenewals} renewals already`);
    }
    loan.renewals += 1;
    loan.due = addDays(today, rules.loanDays);
    return cloneLoan(loan);
  }

  /**
   * Take a copy back. This sets the return date, makes the copy available and
   * charges the late fee, if there is one. When the member is over the fee
   * threshold after the charge, the member is suspended.
   */
  returnCopy(loanId: string, today: IsoDate): ReturnResult {
    requireToday(today);
    const loan = this.require(loanId);
    if (loan.returned !== undefined) {
      throw new LoanError(`Loan ${loanId} is returned already`);
    }
    if (loan.lost === true) {
      throw new LoanError(`Loan ${loanId} is reported lost. Use the lost copy rules instead`);
    }
    loan.returned = today;
    this.catalog.setCopyStatus(loan.copyId, "available");
    const member = this.members.get(loan.memberId);
    const daysLate = daysBetween(loan.due, today);
    const feeCents = calculateLateFee(daysLate, member.tier);
    if (feeCents > 0) {
      this.ledger.charge(loan.memberId, feeCents, `late return of ${loan.id}`, today);
      if (this.ledger.isOverThreshold(loan.memberId)) {
        this.members.suspend(loan.memberId, "fees over the threshold");
      }
    }
    return { loan: cloneLoan(loan), feeCents };
  }

  /**
   * Report a copy as lost. The loan is marked lost, the copy is marked lost and
   * the member is charged the fee for a lost copy.
   */
  reportLost(loanId: string, today: IsoDate): Loan {
    requireToday(today);
    const loan = this.require(loanId);
    if (loan.returned !== undefined) {
      throw new LoanError(`Loan ${loanId} is returned already`);
    }
    if (loan.lost === true) {
      throw new LoanError(`Loan ${loanId} is reported lost already`);
    }
    loan.lost = true;
    this.catalog.setCopyStatus(loan.copyId, "lost");
    this.ledger.charge(loan.memberId, LOST_COPY_FEE_CENTS, `lost copy of ${loan.id}`, today);
    return cloneLoan(loan);
  }

  /** Return a loan by id. Throws LoanError when the loan does not exist. */
  getLoan(loanId: string): Loan {
    return cloneLoan(this.require(loanId));
  }

  /** Return the loans of a member that are not returned and not lost, oldest first. */
  activeLoans(memberId: string): Loan[] {
    return this.all().filter(
      (loan) => loan.memberId === memberId && loan.returned === undefined && loan.lost !== true,
    );
  }

  /** Return the active loans from every member that are past their due date. */
  overdueLoans(today: IsoDate): Loan[] {
    requireToday(today);
    return this.all().filter(
      (loan) => loan.returned === undefined && loan.lost !== true && isAfter(today, loan.due),
    );
  }

  /** Return every loan of a book, oldest first. */
  history(bookId: string): Loan[] {
    return this.all().filter((loan) => loan.bookId === bookId);
  }

  /** Return every loan, oldest first. */
  allLoans(): Loan[] {
    return this.all();
  }

  private all(): Loan[] {
    return [...this.loans.values()].map(cloneLoan);
  }

  private require(loanId: string): Loan {
    const loan = this.loans.get(loanId);
    if (loan === undefined) {
      throw new LoanError(`Unknown loan id: ${loanId}`);
    }
    return loan;
  }

  private makeId(): string {
    const id = `L${this.nextId}`;
    this.nextId += 1;
    return id;
  }
}

/**
 * Check whether a loan can be renewed on a date, without changing it. It
 * returns the reason in a text when the loan cannot be renewed, or undefined
 * when it can.
 */
export function renewalBlocker(
  service: LoanService,
  members: MemberRegistry,
  loanId: string,
  today: IsoDate,
): string | undefined {
  const loan = service.getLoan(loanId);
  if (loan.returned !== undefined) return "returned";
  if (loan.lost === true) return "lost";
  if (isAfter(today, loan.due)) return "overdue";
  if (loan.renewals >= members.rulesFor(loan.memberId).maxRenewals) return "renewal limit";
  return undefined;
}

/**
 * List the active loans that fall due within a number of days from today,
 * both ends included. Overdue loans are not part of the list.
 */
export function dueSoon(service: LoanService, today: IsoDate, withinDays: number): Loan[] {
  requireToday(today);
  if (!Number.isInteger(withinDays) || withinDays < 0) {
    throw new LoanError(`withinDays must be a whole number of 0 or more: ${withinDays}`);
  }
  const limit = addDays(today, withinDays);
  return service
    .allLoans()
    .filter(
      (loan) =>
        loan.returned === undefined &&
        loan.lost !== true &&
        !isAfter(today, loan.due) &&
        !isAfter(loan.due, limit),
    );
}

/** Count the loans that a member has made in total, active or not. */
export function loanCount(service: LoanService, memberId: string): number {
  return service.allLoans().filter((loan) => loan.memberId === memberId).length;
}
