import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Catalog } from "../src/catalog.ts";
import { FeeLedger, LOST_COPY_FEE_CENTS } from "../src/fees.ts";
import { LoanError, LoanService, dueSoon, loanCount, renewalBlocker } from "../src/loans.ts";
import { MemberRegistry } from "../src/members.ts";

interface World {
  catalog: Catalog;
  members: MemberRegistry;
  ledger: FeeLedger;
  service: LoanService;
}

function makeWorld(): World {
  const catalog = new Catalog();
  const members = new MemberRegistry();
  const ledger = new FeeLedger();
  catalog.addBook({ id: "b1", title: "Dune", author: "Frank Herbert", year: 1965 });
  catalog.addBook({ id: "b2", title: "Emma", author: "Jane Austen", year: 1815 });
  catalog.addCopy("b1", "2024-01-01");
  catalog.addCopy("b1", "2024-01-01");
  catalog.addCopy("b2", "2024-01-01");
  members.register({ id: "m1", name: "Carol", email: "carol@example.com", joined: "2024-01-01" });
  members.register({ id: "m2", name: "Alice", email: "alice@example.com", tier: "premium", joined: "2024-01-01" });
  const service = new LoanService(catalog, members, ledger);
  return { catalog, members, ledger, service };
}

/** Add many books with one copy each, so that a member can reach the loan limit. */
function addShelf(world: World, count: number): string[] {
  const ids: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const id = `s${index}`;
    world.catalog.addBook({ id, title: `Shelf ${index}`, author: "Author", year: 2000 });
    world.catalog.addCopy(id, "2024-01-01");
    ids.push(id);
  }
  return ids;
}

describe("loans: checkout", () => {
  it("lends the first available copy and sets the due date by tier", () => {
    const { service, catalog } = makeWorld();
    const standard = service.checkout("m1", "b1", "2024-06-03");
    assert.equal(standard.id, "L1");
    assert.equal(standard.copyId, "b1-c1");
    assert.equal(standard.start, "2024-06-03");
    assert.equal(standard.due, "2024-06-17");
    assert.equal(standard.renewals, 0);
    assert.equal(catalog.getCopy("b1-c1").status, "on-loan");
    const premium = service.checkout("m2", "b1", "2024-06-03");
    assert.equal(premium.copyId, "b1-c2");
    assert.equal(premium.due, "2024-06-24");
  });

  it("refuses when no copy is available", () => {
    const { service } = makeWorld();
    service.checkout("m1", "b2", "2024-06-03");
    assert.throws(() => service.checkout("m2", "b2", "2024-06-03"), /No copy/);
  });

  it("refuses an unknown book, member or date", () => {
    const { service } = makeWorld();
    assert.throws(() => service.checkout("m1", "zz", "2024-06-03"), /Unknown book id/);
    assert.throws(() => service.checkout("zz", "b1", "2024-06-03"), /Unknown member id/);
    assert.throws(() => service.checkout("m1", "b1", "2024-02-31"), /Invalid date/);
  });

  it("refuses a suspended member", () => {
    const { service, members } = makeWorld();
    members.suspend("m1", "test");
    assert.throws(() => service.checkout("m1", "b1", "2024-06-03"), /suspended/);
  });

  it("allows a member again after the member is reactivated", () => {
    const { service, members } = makeWorld();
    members.suspend("m1", "test");
    members.reactivate("m1");
    assert.equal(service.checkout("m1", "b1", "2024-06-03").memberId, "m1");
  });

  it("refuses a standard member at the limit of 5 loans", () => {
    const world = makeWorld();
    const shelf = addShelf(world, 6);
    for (const id of shelf.slice(0, 5)) world.service.checkout("m1", id, "2024-06-03");
    assert.throws(() => world.service.checkout("m1", shelf[5] as string, "2024-06-03"), /5 active loans/);
  });

  it("lets a premium member borrow up to 10 loans", () => {
    const world = makeWorld();
    const shelf = addShelf(world, 11);
    for (const id of shelf.slice(0, 10)) world.service.checkout("m2", id, "2024-06-03");
    assert.equal(world.service.activeLoans("m2").length, 10);
    assert.throws(() => world.service.checkout("m2", shelf[10] as string, "2024-06-03"), /10 active loans/);
  });

  it("frees a place when a loan is returned", () => {
    const world = makeWorld();
    const shelf = addShelf(world, 6);
    const loans = shelf.slice(0, 5).map((id) => world.service.checkout("m1", id, "2024-06-03"));
    world.service.returnCopy((loans[0] as { id: string }).id, "2024-06-04");
    assert.equal(world.service.checkout("m1", shelf[5] as string, "2024-06-04").memberId, "m1");
  });

  it("refuses a member with an overdue loan", () => {
    const { service } = makeWorld();
    service.checkout("m1", "b1", "2024-06-03");
    assert.throws(() => service.checkout("m1", "b2", "2024-06-18"), /overdue/);
  });

  it("does not call a loan overdue on its due date", () => {
    const { service } = makeWorld();
    service.checkout("m1", "b1", "2024-06-03");
    assert.equal(service.checkout("m1", "b2", "2024-06-17").bookId, "b2");
  });

  it("refuses a member who owes more than the threshold", () => {
    const { service, ledger } = makeWorld();
    ledger.charge("m1", 501, "late", "2024-06-01");
    assert.throws(() => service.checkout("m1", "b1", "2024-06-03"), /owes too much/);
  });

  it("allows a member who owes exactly the threshold", () => {
    const { service, ledger } = makeWorld();
    ledger.charge("m1", 500, "late", "2024-06-01");
    assert.equal(service.checkout("m1", "b1", "2024-06-03").memberId, "m1");
  });

  it("does not change the copy when the checkout is refused", () => {
    const { service, catalog, members } = makeWorld();
    members.suspend("m1", "test");
    assert.throws(() => service.checkout("m1", "b1", "2024-06-03"));
    assert.equal(catalog.getCopy("b1-c1").status, "available");
    assert.equal(service.allLoans().length, 0);
  });

  it("returns a copy of the loan, so that a caller cannot change it", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    loan.due = "2030-01-01";
    assert.equal(service.getLoan(loan.id).due, "2024-06-17");
  });
});

describe("loans: renewal", () => {
  it("sets the due date to today plus the loan days", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    const renewed = service.renew(loan.id, "2024-06-10");
    assert.equal(renewed.due, "2024-06-24");
    assert.equal(renewed.renewals, 1);
  });

  it("allows 2 renewals for a standard member and refuses the third", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.renew(loan.id, "2024-06-10");
    service.renew(loan.id, "2024-06-20");
    assert.throws(() => service.renew(loan.id, "2024-06-25"), /2 renewals/);
    assert.equal(service.getLoan(loan.id).renewals, 2);
  });

  it("allows 3 renewals for a premium member", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m2", "b1", "2024-06-03");
    service.renew(loan.id, "2024-06-04");
    service.renew(loan.id, "2024-06-05");
    service.renew(loan.id, "2024-06-06");
    assert.throws(() => service.renew(loan.id, "2024-06-07"), /3 renewals/);
  });

  it("accepts a renewal on the due date", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    assert.equal(service.renew(loan.id, "2024-06-17").due, "2024-07-01");
  });

  it("refuses a renewal after the due date", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    assert.throws(() => service.renew(loan.id, "2024-06-18"), /overdue/);
  });

  it("refuses a loan that is returned or lost", () => {
    const { service } = makeWorld();
    const first = service.checkout("m1", "b1", "2024-06-03");
    const second = service.checkout("m1", "b2", "2024-06-03");
    service.returnCopy(first.id, "2024-06-05");
    service.reportLost(second.id, "2024-06-05");
    assert.throws(() => service.renew(first.id, "2024-06-06"), /returned already/);
    assert.throws(() => service.renew(second.id, "2024-06-06"), /is lost/);
  });

  it("refuses an unknown loan and a bad date", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    assert.throws(() => service.renew("L99", "2024-06-04"), /Unknown loan id/);
    assert.throws(() => service.renew(loan.id, "nope"), /Invalid date/);
  });

  it("explains a blocker without changing the loan", () => {
    const { service, members } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    assert.equal(renewalBlocker(service, members, loan.id, "2024-06-10"), undefined);
    assert.equal(renewalBlocker(service, members, loan.id, "2024-06-18"), "overdue");
    service.renew(loan.id, "2024-06-10");
    service.renew(loan.id, "2024-06-11");
    assert.equal(renewalBlocker(service, members, loan.id, "2024-06-12"), "renewal limit");
    service.returnCopy(loan.id, "2024-06-12");
    assert.equal(renewalBlocker(service, members, loan.id, "2024-06-12"), "returned");
    assert.equal(service.getLoan(loan.id).renewals, 2);
  });

  it("reports a lost loan as a blocker", () => {
    const { service, members } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.reportLost(loan.id, "2024-06-04");
    assert.equal(renewalBlocker(service, members, loan.id, "2024-06-05"), "lost");
  });
});

describe("loans: return", () => {
  it("makes the copy available and charges nothing for a loan on time", () => {
    const { service, catalog, ledger } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    const result = service.returnCopy(loan.id, "2024-06-17");
    assert.equal(result.feeCents, 0);
    assert.equal(result.loan.returned, "2024-06-17");
    assert.equal(catalog.getCopy("b1-c1").status, "available");
    assert.equal(ledger.balance("m1"), 0);
  });

  it("charges the late fee for each day late", () => {
    const { service, ledger } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    const result = service.returnCopy(loan.id, "2024-06-21");
    assert.equal(result.feeCents, 100);
    assert.equal(ledger.balance("m1"), 100);
  });

  it("caps the late fee", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    assert.equal(service.returnCopy(loan.id, "2024-12-31").feeCents, 1000);
  });

  it("gives the premium member half of the late fee", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m2", "b1", "2024-06-03");
    assert.equal(service.returnCopy(loan.id, "2024-06-28").feeCents, 50);
  });

  it("charges the fee on the tier at the time of the return", () => {
    const { service, members } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    members.changeTier("m1", "premium");
    assert.equal(service.returnCopy(loan.id, "2024-06-21").feeCents, 50);
  });

  it("suspends a member whose balance goes over the threshold", () => {
    const { service, members, ledger } = makeWorld();
    ledger.charge("m1", 450, "old fee", "2024-06-01");
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.returnCopy(loan.id, "2024-06-21");
    assert.equal(ledger.balance("m1"), 550);
    assert.equal(members.get("m1").status, "suspended");
    assert.deepEqual(members.suspensionReasons("m1"), ["fees over the threshold"]);
  });

  it("does not suspend a member whose balance stays at the threshold", () => {
    const { service, members, ledger } = makeWorld();
    ledger.charge("m1", 400, "old fee", "2024-06-01");
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.returnCopy(loan.id, "2024-06-21");
    assert.equal(ledger.balance("m1"), 500);
    assert.equal(members.get("m1").status, "active");
  });

  it("does not suspend a member for a loan on time", () => {
    const { service, members } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.returnCopy(loan.id, "2024-06-10");
    assert.equal(members.get("m1").status, "active");
  });

  it("refuses to return a loan twice", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.returnCopy(loan.id, "2024-06-05");
    assert.throws(() => service.returnCopy(loan.id, "2024-06-06"), /returned already/);
  });

  it("refuses to return a lost loan", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.reportLost(loan.id, "2024-06-05");
    assert.throws(() => service.returnCopy(loan.id, "2024-06-06"), /reported lost/);
  });

  it("refuses an unknown loan and a bad date", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    assert.throws(() => service.returnCopy("L99", "2024-06-05"), /Unknown loan id/);
    assert.throws(() => service.returnCopy(loan.id, "2024-06-31"), /Invalid date/);
  });

  it("lets the next member borrow the copy after the return", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b2", "2024-06-03");
    service.returnCopy(loan.id, "2024-06-05");
    assert.equal(service.checkout("m2", "b2", "2024-06-06").copyId, "b2-c1");
  });
});

describe("loans: lost copy", () => {
  it("marks the loan and the copy and charges the lost copy fee", () => {
    const { service, catalog, ledger } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    const lost = service.reportLost(loan.id, "2024-06-10");
    assert.equal(lost.lost, true);
    assert.equal(catalog.getCopy("b1-c1").status, "lost");
    assert.equal(ledger.balance("m1"), LOST_COPY_FEE_CENTS);
  });

  it("refuses to report a loan twice or after a return", () => {
    const { service } = makeWorld();
    const first = service.checkout("m1", "b1", "2024-06-03");
    const second = service.checkout("m1", "b2", "2024-06-03");
    service.reportLost(first.id, "2024-06-10");
    service.returnCopy(second.id, "2024-06-10");
    assert.throws(() => service.reportLost(first.id, "2024-06-11"), /lost already/);
    assert.throws(() => service.reportLost(second.id, "2024-06-11"), /returned already/);
  });

  it("takes the lost loan out of the active loans", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.reportLost(loan.id, "2024-06-10");
    assert.equal(service.activeLoans("m1").length, 0);
    assert.equal(service.overdueLoans("2025-01-01").length, 0);
  });

  it("blocks a new checkout because the fee is over the threshold", () => {
    const { service } = makeWorld();
    const loan = service.checkout("m1", "b1", "2024-06-03");
    service.reportLost(loan.id, "2024-06-10");
    assert.throws(() => service.checkout("m1", "b2", "2024-06-11"), /owes too much/);
  });
});

describe("loans: queries", () => {
  it("lists the active loans of a member, oldest first", () => {
    const { service } = makeWorld();
    const first = service.checkout("m1", "b1", "2024-06-03");
    service.checkout("m2", "b1", "2024-06-03");
    const third = service.checkout("m1", "b2", "2024-06-04");
    service.returnCopy(first.id, "2024-06-05");
    assert.deepEqual(
      service.activeLoans("m1").map((loan) => loan.id),
      [third.id],
    );
  });

  it("lists the overdue loans of every member", () => {
    const { service } = makeWorld();
    service.checkout("m1", "b1", "2024-06-03");
    service.checkout("m2", "b1", "2024-06-03");
    assert.equal(service.overdueLoans("2024-06-17").length, 0);
    assert.deepEqual(
      service.overdueLoans("2024-06-18").map((loan) => loan.memberId),
      ["m1"],
    );
    assert.equal(service.overdueLoans("2024-06-25").length, 2);
  });

  it("lists the history of a book and all loans, oldest first", () => {
    const { service } = makeWorld();
    const first = service.checkout("m1", "b1", "2024-06-03");
    service.returnCopy(first.id, "2024-06-04");
    service.checkout("m2", "b2", "2024-06-05");
    service.checkout("m2", "b1", "2024-06-06");
    assert.deepEqual(
      service.history("b1").map((loan) => loan.id),
      ["L1", "L3"],
    );
    assert.equal(service.allLoans().length, 3);
  });

  it("counts every loan of a member", () => {
    const { service } = makeWorld();
    const first = service.checkout("m1", "b1", "2024-06-03");
    service.returnCopy(first.id, "2024-06-04");
    service.checkout("m1", "b1", "2024-06-05");
    service.checkout("m2", "b2", "2024-06-05");
    assert.equal(loanCount(service, "m1"), 2);
    assert.equal(loanCount(service, "m2"), 1);
    assert.equal(loanCount(service, "zz"), 0);
  });

  it("throws for an unknown loan", () => {
    assert.throws(() => makeWorld().service.getLoan("L1"), LoanError);
  });
});

describe("loans: due soon", () => {
  it("includes both ends of the window", () => {
    const { service } = makeWorld();
    service.checkout("m1", "b1", "2024-06-03");
    assert.equal(dueSoon(service, "2024-06-14", 3).length, 1);
    assert.equal(dueSoon(service, "2024-06-14", 2).length, 0);
    assert.equal(dueSoon(service, "2024-06-17", 0).length, 1);
  });

  it("leaves out overdue, returned and lost loans", () => {
    const { service } = makeWorld();
    const first = service.checkout("m1", "b1", "2024-06-03");
    const second = service.checkout("m2", "b1", "2024-06-03");
    service.returnCopy(first.id, "2024-06-04");
    assert.equal(dueSoon(service, "2024-06-25", 30).length, 0);
    assert.equal(dueSoon(service, "2024-06-20", 30).map((loan) => loan.id).join(), second.id);
    service.reportLost(second.id, "2024-06-21");
    assert.equal(dueSoon(service, "2024-06-20", 30).length, 0);
  });

  it("refuses a bad window or date", () => {
    const { service } = makeWorld();
    assert.throws(() => dueSoon(service, "2024-06-14", -1), /whole number/);
    assert.throws(() => dueSoon(service, "2024-06-14", 1.5), /whole number/);
    assert.throws(() => dueSoon(service, "bad", 3), /Invalid date/);
  });
});
