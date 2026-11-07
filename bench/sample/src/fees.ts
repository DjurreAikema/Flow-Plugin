/**
 * Fees: the late fee rule and the ledger of charges and payments.
 *
 * All money is in integer cents.
 */

import { isValidDate } from "./dates.ts";
import type { IsoDate } from "./dates.ts";
import { TIER_RULES } from "./members.ts";
import type { Tier } from "./members.ts";

/** The error that the fee module throws for bad input or an unknown entry. */
export class FeeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeeError";
  }
}

/** The late fee for each day that a loan is overdue, in cents. */
export const DAILY_LATE_FEE_CENTS = 25;

/** The most that one loan can cost in late fees, before the tier discount, in cents. */
export const MAX_LATE_FEE_CENTS = 1000;

/** A member whose balance is above this amount cannot borrow, in cents. */
export const SUSPEND_THRESHOLD_CENTS = 500;

/** The fee for a lost copy, in cents. */
export const LOST_COPY_FEE_CENTS = 2000;

/** The kinds of entry in the ledger. */
export type EntryKind = "charge" | "payment" | "waiver";

/**
 * One line of the ledger. A charge has a positive amount. A payment and a
 * waiver have a negative amount, so that the balance is the sum of all amounts.
 * A waiver points at the charge that it cancels.
 */
export interface LedgerEntry {
  id: string;
  memberId: string;
  kind: EntryKind;
  cents: number;
  reason: string;
  date: IsoDate;
  waives?: string;
}

/**
 * Calculate the late fee of a loan. A loan that is 0 or fewer days late costs
 * nothing. Otherwise the fee is the days late times the daily fee. The cap of
 * the loan applies first, then the discount of the tier. The result rounds
 * down to whole cents.
 */
export function calculateLateFee(daysLate: number, tier: Tier): number {
  if (!Number.isFinite(daysLate)) {
    throw new FeeError(`The number of days late must be a finite number: ${daysLate}`);
  }
  if (daysLate <= 0) return 0;
  const raw = Math.floor(daysLate) * DAILY_LATE_FEE_CENTS;
  const capped = Math.min(raw, MAX_LATE_FEE_CENTS);
  const discount = TIER_RULES[tier].feeDiscount;
  return Math.floor(capped * (1 - discount));
}

/** Check that an amount is a positive whole number of cents. */
function requireCents(cents: number, what: string): void {
  if (!Number.isInteger(cents) || cents <= 0) {
    throw new FeeError(`${what} must be a positive whole number of cents: ${cents}`);
  }
}

/** Check that a member id and a date are usable. */
function requireMemberAndDate(memberId: string, date: IsoDate): void {
  if (typeof memberId !== "string" || memberId.length === 0) {
    throw new FeeError("A ledger entry needs a member id");
  }
  if (!isValidDate(date)) {
    throw new FeeError(`Invalid date: ${String(date)}`);
  }
}

/** The ledger of fees. It keeps every entry, so that the history stays visible. */
export class FeeLedger {
  private readonly log: LedgerEntry[] = [];
  private nextId = 1;

  /**
   * Charge a member. The amount is a positive number of cents.
   * Returns a copy of the new entry.
   */
  charge(memberId: string, cents: number, reason: string, date: IsoDate): LedgerEntry {
    requireMemberAndDate(memberId, date);
    requireCents(cents, "A charge");
    if (typeof reason !== "string" || reason.trim().length === 0) {
      throw new FeeError("A charge needs a reason");
    }
    const entry: LedgerEntry = {
      id: this.makeId(),
      memberId,
      kind: "charge",
      cents,
      reason: reason.trim(),
      date,
    };
    this.log.push(entry);
    return { ...entry };
  }

  /**
   * Record a payment. The payment must not be above the balance of the member.
   * Returns a copy of the new entry. The amount of a payment is stored as negative.
   */
  pay(memberId: string, cents: number, date: IsoDate): LedgerEntry {
    requireMemberAndDate(memberId, date);
    requireCents(cents, "A payment");
    const balance = this.balance(memberId);
    if (cents > balance) {
      throw new FeeError(`Payment of ${cents} is above the balance of ${balance} for ${memberId}`);
    }
    const entry: LedgerEntry = {
      id: this.makeId(),
      memberId,
      kind: "payment",
      cents: -cents,
      reason: "payment",
      date,
    };
    this.log.push(entry);
    return { ...entry };
  }

  /** Return the amount that a member owes, in cents. It is negative only after a waiver of a charge that was paid. */
  balance(memberId: string): number {
    let total = 0;
    for (const entry of this.log) {
      if (entry.memberId === memberId) total += entry.cents;
    }
    return total;
  }

  /** Return a copy of every entry of a member, in the order in which they were made. */
  entries(memberId: string): LedgerEntry[] {
    return this.log.filter((entry) => entry.memberId === memberId).map((entry) => ({ ...entry }));
  }

  /** Return a copy of every entry of every member, in the order in which they were made. */
  allEntries(): LedgerEntry[] {
    return this.log.map((entry) => ({ ...entry }));
  }

  /** Return the ids of the members that have at least one entry, sorted. */
  memberIds(): string[] {
    return [...new Set(this.log.map((entry) => entry.memberId))].sort();
  }

  /**
   * Waive a charge. This adds a waiver entry that cancels the full amount of
   * the charge. Throws FeeError for an unknown entry, for an entry that is not
   * a charge, and for a charge that is waived already.
   * A waiver can leave a negative balance when the member paid the charge
   * before; that is the amount to give back.
   */
  waive(entryId: string, date: IsoDate): LedgerEntry {
    if (!isValidDate(date)) {
      throw new FeeError(`Invalid date: ${String(date)}`);
    }
    const target = this.log.find((entry) => entry.id === entryId);
    if (target === undefined) {
      throw new FeeError(`Unknown ledger entry: ${entryId}`);
    }
    if (target.kind !== "charge") {
      throw new FeeError(`Only a charge can be waived: ${entryId} is a ${target.kind}`);
    }
    if (this.log.some((entry) => entry.kind === "waiver" && entry.waives === entryId)) {
      throw new FeeError(`Entry ${entryId} is waived already`);
    }
    const entry: LedgerEntry = {
      id: this.makeId(),
      memberId: target.memberId,
      kind: "waiver",
      cents: -target.cents,
      reason: `waiver of ${entryId}`,
      date,
      waives: entryId,
    };
    this.log.push(entry);
    return { ...entry };
  }

  /** Return true when the balance of a member is above the suspension threshold. */
  isOverThreshold(memberId: string): boolean {
    return this.balance(memberId) > SUSPEND_THRESHOLD_CENTS;
  }

  /** Return the total of all charges of a member that were not waived, in cents. */
  totalCharged(memberId: string): number {
    let total = 0;
    for (const entry of this.log) {
      if (entry.memberId === memberId && entry.kind === "charge") total += entry.cents;
    }
    return total;
  }

  /** Return the total of all payments of a member, in cents, as a positive number. */
  totalPaid(memberId: string): number {
    let total = 0;
    for (const entry of this.log) {
      if (entry.memberId === memberId && entry.kind === "payment") total -= entry.cents;
    }
    return total;
  }

  private makeId(): string {
    const id = `E${this.nextId}`;
    this.nextId += 1;
    return id;
  }
}

/** Format an amount of cents as a text with a dollar sign, for example 1250 gives "$12.50". */
export function formatCents(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new FeeError(`An amount must be a whole number of cents: ${cents}`);
  }
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / 100);
  const part = String(absolute % 100).padStart(2, "0");
  return `${sign}$${whole}.${part}`;
}
