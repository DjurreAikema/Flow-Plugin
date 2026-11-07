import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Catalog } from "../src/catalog.ts";
import { FeeLedger } from "../src/fees.ts";
import { HoldError, HoldService } from "../src/holds.ts";
import type { Hold } from "../src/holds.ts";
import { LoanError, LoanService } from "../src/loans.ts";
import { MemberRegistry, TIER_RULES } from "../src/members.ts";
import { holdsReportRows } from "../src/reports.ts";

function makeWorld() {
  const catalog = new Catalog();
  const members = new MemberRegistry();
  const ledger = new FeeLedger();
  const holds = new HoldService(catalog, members);
  const loans = new LoanService(catalog, members, ledger, holds);
  catalog.addBook({ id: "b1", title: "Dune", author: "Frank Herbert", year: 1965 });
  catalog.addBook({ id: "b2", title: "Emma", author: "Jane Austen", year: 1815 });
  catalog.addBook({ id: "b3", title: "Ulysses", author: "James Joyce", year: 1922 });
  catalog.addCopy("b1", "2024-01-01");
  catalog.addCopy("b2", "2024-01-01");
  catalog.addCopy("b2", "2024-01-01");
  catalog.addCopy("b3", "2024-01-01");
  members.register({ id: "m1", name: "Carol", email: "carol@example.com", joined: "2024-01-01" });
  members.register({ id: "m2", name: "Alice", email: "alice@example.com", joined: "2024-01-01" });
  members.register({ id: "m3", name: "Bob", email: "bob@example.com", joined: "2024-01-01" });
  members.register({ id: "m4", name: "Dana", email: "dana@example.com", tier: "premium", joined: "2024-01-01" });
  return { catalog, members, ledger, holds, loans };
}

/** The world where m1 has the only copy of b1 on loan and m2, m3 wait for it. */
function makeQueue() {
  const world = makeWorld();
  const loan = world.loans.checkout("m1", "b1", "2024-06-01");
  world.holds.placeHold("m2", "b1", "2024-06-02");
  world.holds.placeHold("m3", "b1", "2024-06-03");
  return { ...world, loan };
}

/** Add books x0, x1 and so on, with one copy each. Lend all copies to m1 and m3. */
function lendBooks(catalog: Catalog, loans: LoanService, count: number): void {
  for (let index = 0; index < count; index += 1) {
    catalog.addBook({ id: `x${index}`, title: `Extra ${index}`, author: "Author", year: 2000 });
    catalog.addCopy(`x${index}`, "2024-01-01");
    loans.checkout(index % 2 === 0 ? "m1" : "m3", `x${index}`, "2024-06-01");
  }
}

describe("holds: placing a hold", () => {
  it("places a waiting hold with the fields of the brief", () => {
    const { holds, loans } = makeWorld();
    loans.checkout("m1", "b1", "2024-06-01");
    const hold = holds.placeHold("m2", "b1", "2024-06-02");
    assert.equal(hold.id, "H1");
    assert.equal(hold.memberId, "m2");
    assert.equal(hold.bookId, "b1");
    assert.equal(hold.placed, "2024-06-02");
    assert.equal(hold.status, "waiting");
    assert.equal(hold.copyId, undefined);
    assert.equal(hold.readyUntil, undefined);
  });

  it("numbers the holds H1, H2 and so on", () => {
    const { holds } = makeQueue();
    assert.deepEqual(holds.allHolds().map((hold) => hold.id), ["H1", "H2"]);
  });

  it("refuses a hold on a book with an available copy", () => {
    const { holds } = makeWorld();
    assert.throws(() => holds.placeHold("m1", "b1", "2024-06-01"), HoldError);
  });

  it("refuses a hold of a suspended member", () => {
    const { holds, loans, members } = makeWorld();
    loans.checkout("m1", "b1", "2024-06-01");
    members.suspend("m2", "test");
    assert.throws(() => holds.placeHold("m2", "b1", "2024-06-02"), HoldError);
  });

  it("refuses a second open hold of a member on the same book", () => {
    const { holds } = makeQueue();
    assert.throws(() => holds.placeHold("m2", "b1", "2024-06-04"), HoldError);
  });

  it("refuses a hold on a book that the member has on loan", () => {
    const { holds } = makeQueue();
    assert.throws(() => holds.placeHold("m1", "b1", "2024-06-04"), HoldError);
  });

  it("limits the open holds to 3 for standard and 6 for premium", () => {
    assert.equal(TIER_RULES.standard.maxHolds, 3);
    assert.equal(TIER_RULES.premium.maxHolds, 6);
    const { catalog, holds, loans } = makeWorld();
    lendBooks(catalog, loans, 7);
    for (let index = 0; index < 3; index += 1) holds.placeHold("m2", `x${index}`, "2024-06-02");
    assert.throws(() => holds.placeHold("m2", "x3", "2024-06-02"), HoldError);
    for (let index = 0; index < 6; index += 1) holds.placeHold("m4", `x${index}`, "2024-06-02");
    assert.throws(() => holds.placeHold("m4", "x6", "2024-06-02"), HoldError);
  });

  it("does not count a cancelled hold against the limit", () => {
    const { catalog, holds, loans } = makeWorld();
    lendBooks(catalog, loans, 4);
    const first = holds.placeHold("m2", "x0", "2024-06-02");
    holds.placeHold("m2", "x1", "2024-06-02");
    holds.placeHold("m2", "x2", "2024-06-02");
    holds.cancelHold(first.id, "2024-06-03");
    assert.equal(holds.placeHold("m2", "x3", "2024-06-03").status, "waiting");
  });
});

describe("holds: the queue", () => {
  it("lists the waiting holds in the order of placement", () => {
    const { holds } = makeQueue();
    assert.deepEqual(holds.queue("b1").map((hold) => hold.memberId), ["m2", "m3"]);
    assert.deepEqual(holds.queue("b2"), []);
  });

  it("gives the 1-based position of a waiting hold", () => {
    const { holds } = makeQueue();
    assert.equal(holds.position("H1"), 1);
    assert.equal(holds.position("H2"), 2);
  });

  it("moves a hold forward when an earlier hold is cancelled", () => {
    const { holds } = makeQueue();
    holds.cancelHold("H1", "2024-06-04");
    assert.equal(holds.position("H2"), 1);
    assert.equal(holds.position("H1"), null);
  });
});

describe("holds: return and checkout", () => {
  it("keeps the returned copy for the first waiting hold", () => {
    const { catalog, holds, loans, loan } = makeQueue();
    loans.returnCopy(loan.id, "2024-06-10");
    const first = holds.getHold("H1");
    assert.equal(first.status, "ready");
    assert.equal(first.copyId, "b1-c1");
    assert.equal(first.readyUntil, "2024-06-13");
    assert.equal(holds.getHold("H2").status, "waiting");
    assert.equal(catalog.getCopy("b1-c1").status, "on-hold");
    assert.equal(holds.position("H1"), null);
    assert.equal(holds.position("H2"), 1);
  });

  it("makes the copy available when no hold waits", () => {
    const { catalog, loans } = makeWorld();
    const loan = loans.checkout("m1", "b1", "2024-06-01");
    loans.returnCopy(loan.id, "2024-06-05");
    assert.equal(catalog.getCopy("b1-c1").status, "available");
  });

  it("refuses another member a copy that is on hold", () => {
    const { loans, loan } = makeQueue();
    loans.returnCopy(loan.id, "2024-06-10");
    assert.throws(() => loans.checkout("m3", "b1", "2024-06-11"), LoanError);
    assert.throws(() => loans.checkout("m4", "b1", "2024-06-11"), LoanError);
  });

  it("lends the held copy to the member with the ready hold", () => {
    const { catalog, holds, loans, loan } = makeQueue();
    loans.returnCopy(loan.id, "2024-06-10");
    const next = loans.checkout("m2", "b1", "2024-06-11");
    assert.equal(next.copyId, "b1-c1");
    assert.equal(next.memberId, "m2");
    assert.equal(holds.getHold("H1").status, "fulfilled");
    assert.equal(catalog.getCopy("b1-c1").status, "on-loan");
  });

  it("passes the next returned copy on to the next hold", () => {
    const { holds, loans, loan } = makeQueue();
    loans.returnCopy(loan.id, "2024-06-10");
    const next = loans.checkout("m2", "b1", "2024-06-11");
    loans.returnCopy(next.id, "2024-06-12");
    assert.equal(holds.getHold("H2").status, "ready");
    assert.equal(holds.getHold("H2").readyUntil, "2024-06-15");
  });
});

describe("holds: cancel and expire", () => {
  it("cancels a waiting hold", () => {
    const { holds } = makeQueue();
    assert.equal(holds.cancelHold("H2", "2024-06-04").status, "cancelled");
    assert.deepEqual(holds.queue("b1").map((hold) => hold.id), ["H1"]);
  });

  it("passes the copy of a cancelled ready hold to the next waiting hold", () => {
    const { catalog, holds, loans, loan } = makeQueue();
    loans.returnCopy(loan.id, "2024-06-10");
    holds.cancelHold("H1", "2024-06-11");
    const second = holds.getHold("H2");
    assert.equal(second.status, "ready");
    assert.equal(second.copyId, "b1-c1");
    assert.equal(second.readyUntil, "2024-06-14");
    assert.equal(catalog.getCopy("b1-c1").status, "on-hold");
  });

  it("makes the copy of a cancelled ready hold available when no hold waits", () => {
    const { catalog, holds, loans } = makeWorld();
    const loan = loans.checkout("m1", "b1", "2024-06-01");
    holds.placeHold("m2", "b1", "2024-06-02");
    loans.returnCopy(loan.id, "2024-06-05");
    holds.cancelHold("H1", "2024-06-06");
    assert.equal(catalog.getCopy("b1-c1").status, "available");
  });

  it("refuses to cancel a hold that is no longer open", () => {
    const { holds } = makeQueue();
    holds.cancelHold("H1", "2024-06-04");
    assert.throws(() => holds.cancelHold("H1", "2024-06-04"), HoldError);
    assert.throws(() => holds.cancelHold("H9", "2024-06-04"), HoldError);
  });

  it("expires only the ready holds whose date is before today", () => {
    const { holds, loans, loan } = makeQueue();
    loans.returnCopy(loan.id, "2024-06-10");
    assert.deepEqual(holds.expireHolds("2024-06-13"), []);
    assert.equal(holds.getHold("H1").status, "ready");
    const expired: Hold[] = holds.expireHolds("2024-06-14");
    assert.deepEqual(expired.map((hold) => hold.id), ["H1"]);
    assert.equal(holds.getHold("H1").status, "expired");
  });

  it("passes the copy of an expired hold to the next waiting hold", () => {
    const { holds, loans, loan } = makeQueue();
    loans.returnCopy(loan.id, "2024-06-10");
    holds.expireHolds("2024-06-14");
    const second = holds.getHold("H2");
    assert.equal(second.status, "ready");
    assert.equal(second.readyUntil, "2024-06-17");
  });

  it("frees the copy of an expired hold when no hold waits", () => {
    const { catalog, holds, loans } = makeWorld();
    const loan = loans.checkout("m1", "b1", "2024-06-01");
    holds.placeHold("m2", "b1", "2024-06-02");
    loans.returnCopy(loan.id, "2024-06-05");
    holds.expireHolds("2024-06-09");
    assert.equal(catalog.getCopy("b1-c1").status, "available");
    assert.equal(loans.checkout("m3", "b1", "2024-06-09").copyId, "b1-c1");
  });
});

describe("holds: report", () => {
  it("gives one row per waiting or ready hold, sorted by title, then position", () => {
    const { catalog, members, holds, loans, loan } = makeQueue();
    const e1 = loans.checkout("m1", "b2", "2024-06-01");
    loans.checkout("m4", "b2", "2024-06-01");
    holds.placeHold("m3", "b2", "2024-06-02");
    loans.returnCopy(loan.id, "2024-06-10");
    loans.returnCopy(e1.id, "2024-06-10");
    holds.placeHold("m1", "b1", "2024-06-11");
    const rows = holdsReportRows(holds.allHolds(), catalog, members, "2024-06-11");
    assert.deepEqual(
      rows.map((row) => [row.title, row.memberName, row.status, row.position]),
      [
        ["Dune", "Alice", "ready", 0],
        ["Dune", "Bob", "waiting", 1],
        ["Dune", "Carol", "waiting", 2],
        ["Emma", "Bob", "ready", 0],
      ],
    );
    assert.equal(rows[0]?.readyUntil, "2024-06-13");
    assert.equal(rows[3]?.readyUntil, "2024-06-13");
  });

  it("leaves out fulfilled, cancelled and expired holds", () => {
    const { catalog, members, holds, loans, loan } = makeQueue();
    loans.returnCopy(loan.id, "2024-06-10");
    holds.cancelHold("H2", "2024-06-10");
    loans.checkout("m2", "b1", "2024-06-11");
    assert.deepEqual(holdsReportRows(holds.allHolds(), catalog, members, "2024-06-11"), []);
  });
});
