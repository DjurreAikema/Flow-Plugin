import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MemberError, MemberRegistry, TIER_RULES, isTier, isValidEmail } from "../src/members.ts";

function makeRegistry(): MemberRegistry {
  const registry = new MemberRegistry();
  registry.register({ id: "m1", name: "Carol", email: "carol@example.com", joined: "2024-01-01" });
  registry.register({ id: "m2", name: "Alice", email: "alice@example.com", tier: "premium", joined: "2024-02-01" });
  registry.register({ id: "m3", name: "Bob", email: "bob@example.com", joined: "2024-03-01" });
  return registry;
}

describe("members: email check", () => {
  it("accepts a simple address", () => {
    assert.equal(isValidEmail("a@b.com"), true);
    assert.equal(isValidEmail("first.last@mail.example.org"), true);
  });

  it("refuses an address without a part", () => {
    assert.equal(isValidEmail("a@"), false);
    assert.equal(isValidEmail("@b.com"), false);
    assert.equal(isValidEmail("ab.com"), false);
    assert.equal(isValidEmail("a@@b.com"), false);
  });

  it("refuses a domain without a usable dot", () => {
    assert.equal(isValidEmail("a@b"), false);
    assert.equal(isValidEmail("a@.com"), false);
    assert.equal(isValidEmail("a@b."), false);
  });

  it("refuses spaces and values that are not text", () => {
    assert.equal(isValidEmail("a b@c.com"), false);
    assert.equal(isValidEmail(42), false);
    assert.equal(isValidEmail(undefined), false);
  });
});

describe("members: tiers", () => {
  it("recognizes the tier names", () => {
    assert.equal(isTier("standard"), true);
    assert.equal(isTier("premium"), true);
    assert.equal(isTier("gold"), false);
  });

  it("gives the premium tier better rules than the standard tier", () => {
    assert.ok(TIER_RULES.premium.maxLoans > TIER_RULES.standard.maxLoans);
    assert.ok(TIER_RULES.premium.loanDays > TIER_RULES.standard.loanDays);
    assert.ok(TIER_RULES.premium.maxRenewals > TIER_RULES.standard.maxRenewals);
    assert.ok(TIER_RULES.premium.feeDiscount > TIER_RULES.standard.feeDiscount);
  });
});

describe("members: registration", () => {
  it("registers an active standard member by default", () => {
    const member = makeRegistry().get("m1");
    assert.equal(member.status, "active");
    assert.equal(member.tier, "standard");
  });

  it("trims the name", () => {
    const registry = new MemberRegistry();
    const member = registry.register({ id: "m", name: "  Dan  ", email: "d@e.com", joined: "2024-01-01" });
    assert.equal(member.name, "Dan");
  });

  it("refuses an empty id or name", () => {
    const registry = new MemberRegistry();
    assert.throws(() => registry.register({ id: "", name: "A", email: "a@b.com", joined: "2024-01-01" }), MemberError);
    assert.throws(() => registry.register({ id: "x", name: "  ", email: "a@b.com", joined: "2024-01-01" }), MemberError);
  });

  it("refuses a bad email, a bad date and an unknown tier", () => {
    const registry = new MemberRegistry();
    assert.throws(
      () => registry.register({ id: "x", name: "A", email: "nope", joined: "2024-01-01" }),
      /Invalid email/,
    );
    assert.throws(
      () => registry.register({ id: "x", name: "A", email: "a@b.com", joined: "2024-13-01" }),
      /Invalid join date/,
    );
    assert.throws(
      () => registry.register({ id: "x", name: "A", email: "a@b.com", joined: "2024-01-01", tier: "gold" as never }),
      /Unknown tier/,
    );
  });

  it("refuses a duplicate id", () => {
    const registry = makeRegistry();
    assert.throws(
      () => registry.register({ id: "m1", name: "Z", email: "z@example.com", joined: "2024-01-01" }),
      /Duplicate member id/,
    );
  });

  it("refuses a duplicate email, ignoring case", () => {
    const registry = makeRegistry();
    assert.throws(
      () => registry.register({ id: "m9", name: "Z", email: "CAROL@Example.com", joined: "2024-01-01" }),
      /Duplicate email/,
    );
  });

  it("does not keep a member after a refused registration", () => {
    const registry = makeRegistry();
    assert.throws(() => registry.register({ id: "m9", name: "Z", email: "bad", joined: "2024-01-01" }));
    assert.equal(registry.has("m9"), false);
    assert.equal(registry.size, 3);
  });

  it("returns copies, so that a caller cannot change the stored member", () => {
    const registry = makeRegistry();
    const member = registry.get("m1");
    member.status = "suspended";
    assert.equal(registry.get("m1").status, "active");
  });

  it("throws for an unknown member", () => {
    assert.throws(() => makeRegistry().get("zz"), /Unknown member id/);
    assert.equal(makeRegistry().has("zz"), false);
  });
});

describe("members: list", () => {
  it("sorts by name and then by id", () => {
    const registry = makeRegistry();
    registry.register({ id: "m0", name: "Alice", email: "alice2@example.com", joined: "2024-04-01" });
    assert.deepEqual(
      registry.list().map((member) => member.id),
      ["m0", "m2", "m3", "m1"],
    );
  });

  it("filters by tier and by status", () => {
    const registry = makeRegistry();
    registry.suspend("m3", "late");
    assert.deepEqual(registry.list({ tier: "premium" }).map((member) => member.id), ["m2"]);
    assert.deepEqual(registry.list({ status: "suspended" }).map((member) => member.id), ["m3"]);
    assert.deepEqual(registry.list({ status: "active", tier: "standard" }).map((member) => member.id), ["m1"]);
  });

  it("filters by a part of the name, ignoring case", () => {
    const registry = makeRegistry();
    assert.deepEqual(registry.list({ nameContains: "  AL " }).map((member) => member.id), ["m2"]);
    assert.equal(registry.list({ nameContains: "" }).length, 3);
    assert.equal(registry.list({ nameContains: "zzz" }).length, 0);
  });
});

describe("members: suspension", () => {
  it("suspends and reactivates a member", () => {
    const registry = makeRegistry();
    assert.equal(registry.suspend("m1", "unpaid fees").status, "suspended");
    assert.equal(registry.reactivate("m1").status, "active");
  });

  it("requires a reason", () => {
    const registry = makeRegistry();
    assert.throws(() => registry.suspend("m1", "  "), /needs a reason/);
    assert.equal(registry.get("m1").status, "active");
  });

  it("refuses to suspend an unknown member", () => {
    assert.throws(() => makeRegistry().suspend("zz", "x"), /Unknown member id/);
    assert.throws(() => makeRegistry().reactivate("zz"), /Unknown member id/);
  });

  it("records every reason, oldest first, also for a second suspension", () => {
    const registry = makeRegistry();
    registry.suspend("m1", " first ");
    registry.suspend("m1", "second");
    registry.suspend("m2", "other");
    assert.deepEqual(registry.suspensionReasons("m1"), ["first", "second"]);
    assert.deepEqual(registry.suspensionReasons("m3"), []);
    assert.throws(() => registry.suspensionReasons("zz"), MemberError);
  });

  it("keeps an active member active when it is reactivated", () => {
    assert.equal(makeRegistry().reactivate("m1").status, "active");
  });
});

describe("members: tier changes and rules", () => {
  it("changes the tier and the rules follow", () => {
    const registry = makeRegistry();
    assert.equal(registry.rulesFor("m1").maxLoans, TIER_RULES.standard.maxLoans);
    registry.changeTier("m1", "premium");
    assert.equal(registry.rulesFor("m1").maxLoans, TIER_RULES.premium.maxLoans);
    assert.equal(registry.rulesFor("m1").loanDays, 21);
  });

  it("refuses an unknown tier and an unknown member", () => {
    const registry = makeRegistry();
    assert.throws(() => registry.changeTier("m1", "gold" as never), /Unknown tier/);
    assert.throws(() => registry.changeTier("zz", "premium"), /Unknown member id/);
    assert.equal(registry.get("m1").tier, "standard");
  });
});
