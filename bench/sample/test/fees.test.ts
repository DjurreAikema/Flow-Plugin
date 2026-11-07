import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DAILY_LATE_FEE_CENTS,
  FeeError,
  FeeLedger,
  LOST_COPY_FEE_CENTS,
  MAX_LATE_FEE_CENTS,
  SUSPEND_THRESHOLD_CENTS,
  calculateLateFee,
  formatCents,
} from "../src/fees.ts";

describe("fees: late fee", () => {
  it("costs nothing for a loan that is not late", () => {
    assert.equal(calculateLateFee(0, "standard"), 0);
    assert.equal(calculateLateFee(-3, "standard"), 0);
    assert.equal(calculateLateFee(-3, "premium"), 0);
  });

  it("charges the daily fee for each day late", () => {
    assert.equal(calculateLateFee(1, "standard"), DAILY_LATE_FEE_CENTS);
    assert.equal(calculateLateFee(10, "standard"), 10 * DAILY_LATE_FEE_CENTS);
  });

  it("applies the cap of the loan", () => {
    const capDays = MAX_LATE_FEE_CENTS / DAILY_LATE_FEE_CENTS;
    assert.equal(calculateLateFee(capDays, "standard"), MAX_LATE_FEE_CENTS);
    assert.equal(calculateLateFee(capDays + 1, "standard"), MAX_LATE_FEE_CENTS);
    assert.equal(calculateLateFee(1000, "standard"), MAX_LATE_FEE_CENTS);
  });

  it("applies the discount of the premium tier after the cap", () => {
    assert.equal(calculateLateFee(4, "premium"), 50);
    assert.equal(calculateLateFee(1000, "premium"), MAX_LATE_FEE_CENTS / 2);
  });

  it("rounds down to whole cents", () => {
    assert.equal(calculateLateFee(1, "premium"), 12);
    assert.equal(calculateLateFee(3, "premium"), 37);
  });

  it("refuses a number of days that is not finite", () => {
    assert.throws(() => calculateLateFee(Number.NaN, "standard"), FeeError);
    assert.throws(() => calculateLateFee(Number.POSITIVE_INFINITY, "standard"), FeeError);
  });
});

describe("fees: charges", () => {
  it("records a charge and raises the balance", () => {
    const ledger = new FeeLedger();
    const entry = ledger.charge("m1", 300, " late ", "2024-05-01");
    assert.equal(entry.kind, "charge");
    assert.equal(entry.cents, 300);
    assert.equal(entry.reason, "late");
    assert.equal(ledger.balance("m1"), 300);
    assert.equal(ledger.balance("m2"), 0);
  });

  it("gives unique ids in order", () => {
    const ledger = new FeeLedger();
    assert.equal(ledger.charge("m1", 100, "a", "2024-05-01").id, "E1");
    assert.equal(ledger.charge("m1", 100, "b", "2024-05-01").id, "E2");
  });

  it("refuses an amount that is not a positive whole number", () => {
    const ledger = new FeeLedger();
    assert.throws(() => ledger.charge("m1", 0, "x", "2024-05-01"), FeeError);
    assert.throws(() => ledger.charge("m1", -5, "x", "2024-05-01"), FeeError);
    assert.throws(() => ledger.charge("m1", 10.5, "x", "2024-05-01"), FeeError);
  });

  it("refuses a missing reason, member or date", () => {
    const ledger = new FeeLedger();
    assert.throws(() => ledger.charge("m1", 100, "  ", "2024-05-01"), /needs a reason/);
    assert.throws(() => ledger.charge("", 100, "x", "2024-05-01"), /member id/);
    assert.throws(() => ledger.charge("m1", 100, "x", "2024-05-32"), /Invalid date/);
  });

  it("returns copies, so that a caller cannot change the ledger", () => {
    const ledger = new FeeLedger();
    const entry = ledger.charge("m1", 100, "x", "2024-05-01");
    entry.cents = 99999;
    assert.equal(ledger.balance("m1"), 100);
  });
});

describe("fees: payments", () => {
  it("lowers the balance and stores a negative amount", () => {
    const ledger = new FeeLedger();
    ledger.charge("m1", 300, "late", "2024-05-01");
    const entry = ledger.pay("m1", 100, "2024-05-02");
    assert.equal(entry.cents, -100);
    assert.equal(entry.kind, "payment");
    assert.equal(ledger.balance("m1"), 200);
  });

  it("accepts a payment of the whole balance", () => {
    const ledger = new FeeLedger();
    ledger.charge("m1", 300, "late", "2024-05-01");
    ledger.pay("m1", 300, "2024-05-02");
    assert.equal(ledger.balance("m1"), 0);
  });

  it("refuses a payment above the balance", () => {
    const ledger = new FeeLedger();
    ledger.charge("m1", 300, "late", "2024-05-01");
    assert.throws(() => ledger.pay("m1", 301, "2024-05-02"), /above the balance/);
    assert.equal(ledger.balance("m1"), 300);
  });

  it("refuses a payment from a member without a balance", () => {
    assert.throws(() => new FeeLedger().pay("m1", 1, "2024-05-02"), FeeError);
  });

  it("refuses an amount that is not a positive whole number", () => {
    const ledger = new FeeLedger();
    ledger.charge("m1", 300, "late", "2024-05-01");
    assert.throws(() => ledger.pay("m1", 0, "2024-05-02"), FeeError);
    assert.throws(() => ledger.pay("m1", -1, "2024-05-02"), FeeError);
    assert.throws(() => ledger.pay("m1", 1.5, "2024-05-02"), FeeError);
  });
});

describe("fees: waivers", () => {
  it("cancels a charge", () => {
    const ledger = new FeeLedger();
    const charge = ledger.charge("m1", 300, "late", "2024-05-01");
    const waiver = ledger.waive(charge.id, "2024-05-03");
    assert.equal(waiver.kind, "waiver");
    assert.equal(waiver.waives, charge.id);
    assert.equal(waiver.cents, -300);
    assert.equal(ledger.balance("m1"), 0);
  });

  it("refuses an unknown entry", () => {
    assert.throws(() => new FeeLedger().waive("E99", "2024-05-03"), /Unknown ledger entry/);
  });

  it("refuses to waive a payment or a waiver", () => {
    const ledger = new FeeLedger();
    const charge = ledger.charge("m1", 300, "late", "2024-05-01");
    const payment = ledger.pay("m1", 100, "2024-05-02");
    assert.throws(() => ledger.waive(payment.id, "2024-05-03"), /Only a charge/);
    const waiver = ledger.waive(charge.id, "2024-05-03");
    assert.throws(() => ledger.waive(waiver.id, "2024-05-03"), /Only a charge/);
  });

  it("refuses to waive a charge twice", () => {
    const ledger = new FeeLedger();
    const charge = ledger.charge("m1", 300, "late", "2024-05-01");
    ledger.waive(charge.id, "2024-05-03");
    assert.throws(() => ledger.waive(charge.id, "2024-05-04"), /waived already/);
  });

  it("refuses a bad date", () => {
    const ledger = new FeeLedger();
    const charge = ledger.charge("m1", 300, "late", "2024-05-01");
    assert.throws(() => ledger.waive(charge.id, "soon"), /Invalid date/);
  });

  it("leaves a negative balance when the charge was paid before", () => {
    const ledger = new FeeLedger();
    const charge = ledger.charge("m1", 300, "late", "2024-05-01");
    ledger.pay("m1", 300, "2024-05-02");
    ledger.waive(charge.id, "2024-05-03");
    assert.equal(ledger.balance("m1"), -300);
  });
});

describe("fees: threshold and totals", () => {
  it("is over the threshold only above the limit", () => {
    const ledger = new FeeLedger();
    ledger.charge("m1", SUSPEND_THRESHOLD_CENTS, "late", "2024-05-01");
    assert.equal(ledger.isOverThreshold("m1"), false);
    ledger.charge("m1", 1, "late", "2024-05-01");
    assert.equal(ledger.isOverThreshold("m1"), true);
  });

  it("drops under the threshold after a payment", () => {
    const ledger = new FeeLedger();
    ledger.charge("m1", 600, "late", "2024-05-01");
    ledger.pay("m1", 200, "2024-05-02");
    assert.equal(ledger.isOverThreshold("m1"), false);
  });

  it("totals the charges and the payments of a member", () => {
    const ledger = new FeeLedger();
    ledger.charge("m1", 300, "a", "2024-05-01");
    ledger.charge("m1", 200, "b", "2024-05-01");
    ledger.charge("m2", 999, "c", "2024-05-01");
    ledger.pay("m1", 150, "2024-05-02");
    assert.equal(ledger.totalCharged("m1"), 500);
    assert.equal(ledger.totalPaid("m1"), 150);
    assert.equal(ledger.totalPaid("m2"), 0);
  });

  it("lists the entries of a member and of everybody", () => {
    const ledger = new FeeLedger();
    ledger.charge("m1", 100, "a", "2024-05-01");
    ledger.charge("m2", 100, "b", "2024-05-01");
    ledger.charge("m1", 100, "c", "2024-05-01");
    assert.equal(ledger.entries("m1").length, 2);
    assert.equal(ledger.allEntries().length, 3);
    assert.deepEqual(ledger.memberIds().sort(), ["m1", "m2"]);
  });

  it("has a lost copy fee above the threshold", () => {
    assert.ok(LOST_COPY_FEE_CENTS > SUSPEND_THRESHOLD_CENTS);
  });
});

describe("fees: formatting", () => {
  it("formats cents as dollars", () => {
    assert.equal(formatCents(1250), "$12.50");
    assert.equal(formatCents(5), "$0.05");
    assert.equal(formatCents(0), "$0.00");
    assert.equal(formatCents(100), "$1.00");
  });

  it("formats a negative amount with a sign", () => {
    assert.equal(formatCents(-250), "-$2.50");
  });

  it("refuses an amount that is not whole", () => {
    assert.throws(() => formatCents(1.5), FeeError);
  });
});
