import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Catalog } from "../src/catalog.ts";
import { FeeLedger } from "../src/fees.ts";
import { LoanService } from "../src/loans.ts";
import { MemberRegistry } from "../src/members.ts";

const TODAY = "2024-06-20";

function makeWorld() {
  const catalog = new Catalog();
  const members = new MemberRegistry();
  const ledger = new FeeLedger();
  const loans = new LoanService(catalog, members, ledger);
  catalog.addBook({ id: "b1", title: "Dune", author: "Frank Herbert", year: 1965 });
  catalog.addBook({ id: "b2", title: "Emma", author: "Jane Austen", year: 1815 });
  catalog.addCopy("b1", "2024-01-01");
  catalog.addCopy("b2", "2024-01-01");
  members.register({ id: "m1", name: "Carol", email: "carol@example.com", joined: "2024-01-01" });
  members.register({ id: "m2", name: "Alice", email: "alice@example.com", tier: "premium", joined: "2024-01-01" });
  return { catalog, members, ledger, loans };
}

/** The state that a refused close must leave as it is. */
function snapshot(world: ReturnType<typeof makeWorld>, memberId: string) {
  return {
    member: world.members.get(memberId),
    entries: world.ledger.entries(memberId),
    active: world.loans.activeLoans(memberId),
  };
}

describe("closing: the basic flow", () => {
  it("closes an account with the status closed", () => {
    const { members, loans } = makeWorld();
    const closed = loans.closeAccount("m1", TODAY);
    assert.equal(closed.status, "closed");
    assert.equal(members.get("m1").status, "closed");
  });

  it("refuses a checkout of a closed member", () => {
    const { loans } = makeWorld();
    loans.closeAccount("m1", TODAY);
    assert.throws(() => loans.checkout("m1", "b1", "2024-06-21"));
  });

  it("refuses to close an account twice", () => {
    const { loans } = makeWorld();
    loans.closeAccount("m1", TODAY);
    assert.throws(() => loans.closeAccount("m1", "2024-06-21"));
  });

  it("clears a small balance when the account closes", () => {
    const { ledger, loans } = makeWorld();
    ledger.charge("m1", 300, "late return", "2024-06-10");
    loans.closeAccount("m1", TODAY);
    assert.equal(ledger.balance("m1"), 0);
  });

  it("leaves the other members as they are", () => {
    const world = makeWorld();
    const before = snapshot(world, "m2");
    world.loans.closeAccount("m1", TODAY);
    assert.deepEqual(snapshot(world, "m2"), before);
  });
});

describe("closing: open loans and big fees", () => {
  it("refuses to close an account with an active loan", () => {
    const { loans } = makeWorld();
    loans.checkout("m1", "b1", "2024-06-01");
    assert.throws(() => loans.closeAccount("m1", TODAY));
  });

  it("refuses to close an account with a balance above five dollars", () => {
    const { ledger, loans } = makeWorld();
    ledger.charge("m1", 2000, "lost copy", "2024-06-10");
    assert.throws(() => loans.closeAccount("m1", TODAY));
  });

  it("changes nothing when it refuses to close", () => {
    const world = makeWorld();
    world.loans.checkout("m1", "b1", "2024-06-01");
    world.ledger.charge("m2", 2000, "lost copy", "2024-06-10");
    const before1 = snapshot(world, "m1");
    const before2 = snapshot(world, "m2");
    assert.throws(() => world.loans.closeAccount("m1", TODAY));
    assert.throws(() => world.loans.closeAccount("m2", TODAY));
    assert.deepEqual(snapshot(world, "m1"), before1);
    assert.deepEqual(snapshot(world, "m2"), before2);
  });

  it("closes the account after the copy comes back", () => {
    const { members, loans } = makeWorld();
    const loan = loans.checkout("m1", "b1", "2024-06-01");
    loans.returnCopy(loan.id, "2024-06-10");
    loans.closeAccount("m1", TODAY);
    assert.equal(members.get("m1").status, "closed");
  });
});

describe("closing: the ledger and the member record", () => {
  it("keeps every earlier ledger entry", () => {
    const { ledger, loans } = makeWorld();
    const charge = ledger.charge("m1", 400, "late return", "2024-06-05");
    ledger.pay("m1", 100, "2024-06-06");
    const before = ledger.entries("m1");
    loans.closeAccount("m1", TODAY);
    const after = ledger.entries("m1");
    assert.ok(after.length > before.length);
    assert.deepEqual(after.slice(0, before.length), before);
    assert.deepEqual(after[0], charge);
    assert.equal(ledger.balance("m1"), 0);
  });

  it("keeps the record of a closed member", () => {
    const { members, loans } = makeWorld();
    loans.closeAccount("m1", TODAY);
    assert.equal(members.has("m1"), true);
    assert.equal(members.size, 2);
    assert.deepEqual(
      members.list().map((member) => member.id),
      ["m2", "m1"],
    );
  });

  it("keeps the loan history of a closed member", () => {
    const { loans } = makeWorld();
    const loan = loans.checkout("m1", "b1", "2024-06-01");
    loans.returnCopy(loan.id, "2024-06-10");
    loans.closeAccount("m1", TODAY);
    assert.equal(loans.getLoan(loan.id).memberId, "m1");
    assert.equal(loans.history("b1").length, 1);
  });
});

describe("closing: what stays out", () => {
  it("keeps the name and the email of a closed member", () => {
    const { members, loans } = makeWorld();
    loans.closeAccount("m1", TODAY);
    const member = members.get("m1");
    assert.equal(member.name, "Carol");
    assert.equal(member.email, "carol@example.com");
  });

  it("keeps the email of a closed member taken", () => {
    const { members, loans } = makeWorld();
    loans.closeAccount("m1", TODAY);
    assert.throws(() =>
      members.register({ id: "m9", name: "Other", email: "carol@example.com", joined: "2024-07-01" }),
    );
  });
});
